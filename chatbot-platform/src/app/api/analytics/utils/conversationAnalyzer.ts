// src/app/api/analytics/utils/conversationAnalyzer.ts
import { PoolClient } from "pg";
import { IntentInsight, ConversationFlowStep } from "@/types/analytics";

// Color palette for flow steps
const FLOW_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // green
  "#f97316", // orange
  "#ef4444", // red
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
];

/**
 * Infer intent from message content when metadata is missing or incomplete
 */
function inferIntentFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Basic pattern matching to infer intent
  if (lowerContent.includes('add to cart') || 
      lowerContent.includes('buy') || 
      lowerContent.includes('purchase') ||
      (lowerContent.includes('add') && lowerContent.includes('cart'))) {
    return 'cart_add';
  }
  
  if (lowerContent.includes('remove') && lowerContent.includes('cart')) {
    return 'cart_remove';
  }
  
  if (lowerContent.includes('show me') || 
      lowerContent.includes('view') || 
      lowerContent.includes('tell me about') ||
      lowerContent.includes('information')) {
    return 'product_view';
  }
  
  if (lowerContent.includes('take me to') || 
      lowerContent.includes('navigate') || 
      lowerContent.includes('go to')) {
    return 'navigate';
  }
  
  if (lowerContent.includes('?') || 
      lowerContent.includes('what') || 
      lowerContent.includes('how') || 
      lowerContent.includes('when') || 
      lowerContent.includes('can you')) {
    return 'question';
  }
  
  // Default if no patterns match
  return 'other';
}

/**
 * Analyzes conversation data to identify patterns and generate insights
 */
export async function analyzeConversationInsights(
  client: PoolClient,
  apiKey: string
): Promise<IntentInsight[]> {
  try {
    // Get conversations with structured metadata
    const result = await client.query(`
      SELECT 
        message_content, 
        message_role,
        metadata
      FROM conversations
      WHERE api_key = $1
      ORDER BY created_at ASC
    `, [apiKey]);

    // For completely empty datasets, return empty array instead of mocked data
    if (result.rows.length === 0) {
      return [];
    }

    // Extract intent analysis data - more flexible to work with minimal data
    const intents = result.rows
      .filter(row => row.message_role === "user")
      .map(row => {
        // Try to extract intent from metadata if available, or infer from content
        const intent = row.metadata?.intentAnalysis?.primaryIntent || 
                      (row.metadata?.analysis?.user_intents && row.metadata.analysis.user_intents[0]) || 
                      inferIntentFromContent(row.message_content);
                      
        return {
          intent: intent,
          reasoning: row.metadata?.intentAnalysis?.reasoning || '',
          confidence: row.metadata?.intentAnalysis?.confidence || 0.75,
          message: row.message_content
        };
      });

    // Calculate sequence patterns
    // Find patterns in conversation flow - sequences of intents
    const intentSequences = [];
    for (let i = 0; i < intents.length - 1; i++) {
      intentSequences.push({
        from: intents[i].intent,
        to: intents[i+1].intent,
        messageFrom: intents[i].message,
        messageTo: intents[i+1].message,
      });
    }

    // Generate insights
    const insights: IntentInsight[] = [];

    // Most common intent
    if (intents.length > 0) {
      const intentCounts = {};
      intents.forEach(i => {
        const intent = i.intent || 'other';
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      });
      
      const mostCommonIntent = Object.keys(intentCounts).reduce((a, b) => 
        intentCounts[a] > intentCounts[b] ? a : b, Object.keys(intentCounts)[0] || 'question'
      );
      
      const percentageOfTotal = Math.round((intentCounts[mostCommonIntent] / Math.max(intents.length, 1)) * 100);
      
      insights.push({
        insight: `${percentageOfTotal}% of user requests are ${formatIntentName(mostCommonIntent)}`,
        explanation: `The most common user intent is ${formatIntentName(mostCommonIntent)}, accounting for ${percentageOfTotal}% of all conversation intents.`,
        importance: percentageOfTotal > 50 ? "high" : "medium",
        confidence: 0.9
      });
    }

    // If we have product questions, add an insight about that
    const questions = intents.filter(i => i.intent === 'question');
    if (questions.length > 0) {
      const questionPercentage = Math.round((questions.length / Math.max(intents.length, 1)) * 100);
      
      insights.push({
        insight: `${questionPercentage}% of interactions are product questions`,
        explanation: `Users frequently ask questions about products, suggesting they need detailed information before making purchase decisions.`,
        importance: "medium",
        confidence: 0.85
      });
    }

    // Intent transitions
    if (intentSequences.length > 0) {
      // Count transitions
      const transitionCounts = {};
      intentSequences.forEach(seq => {
        const key = `${seq.from}>${seq.to}`;
        transitionCounts[key] = (transitionCounts[key] || 0) + 1;
      });
      
      // Find most common transition
      const transitions = Object.keys(transitionCounts);
      const mostCommonTransition = transitions.length > 0 ? 
        transitions.reduce((a, b) => transitionCounts[a] > transitionCounts[b] ? a : b, transitions[0]) :
        'question>cart_add';
      
      const [fromIntent, toIntent] = mostCommonTransition.split('>');
      
      const example = intentSequences.find(seq => 
        seq.from === fromIntent && seq.to === toIntent
      );
      
      const exampleText = example ? 
        `For example: "${truncateText(example.messageFrom, 30)}" followed by "${truncateText(example.messageTo, 30)}"` :
        "This suggests a clear path in the customer journey.";
      
      insights.push({
        insight: `Users often transition from ${formatIntentName(fromIntent)} to ${formatIntentName(toIntent)}`,
        explanation: `A common conversation pattern shows users asking about ${formatIntentName(fromIntent)} followed by ${formatIntentName(toIntent)}. ${exampleText}`,
        importance: "medium",
        confidence: 0.85
      });
    }

    // Cart operations
    const cartOperations = result.rows.filter(row => 
      row.metadata?.action?.type === 'cart' || 
      row.metadata?.action?.operation === 'add' ||
      row.metadata?.action?.operation === 'remove' ||
      (row.message_role === "user" && 
       (row.message_content.toLowerCase().includes("cart") || 
        row.message_content.toLowerCase().includes("buy")))
    );
    
    if (cartOperations.length > 0 || intents.some(i => i.intent === 'cart_add')) {
      // Add cart operation insight
      insights.push({
        insight: "Cart actions are common in conversations",
        explanation: "Users frequently use the chatbot to add items to their cart, suggesting the bot is effective for direct conversions.",
        importance: "high",
        confidence: 0.9
      });
    }

    // Navigation patterns
    const navigationActions = result.rows.filter(row => 
      (row.metadata?.action?.type === 'navigate' || 
       row.metadata?.navigationAction?.type === 'navigate') ||
      (row.message_role === "user" && 
       (row.message_content.toLowerCase().includes("go to") || 
        row.message_content.toLowerCase().includes("take me to")))
    );
    
    if (navigationActions.length > 0 || intents.some(i => i.intent === 'navigate')) {
      insights.push({
        insight: "Users rely on the bot for site navigation",
        explanation: "Navigation requests are common, showing that users trust the chatbot to help them find what they're looking for on the site.",
        importance: "medium",
        confidence: 0.85
      });
    }

    // Return only actual insights - no minimum count requirement or synthetic data
    // We've removed the code that adds fallback insights

    // Return generated insights or fallback to defaults if none were created
    return insights;
  } catch (error) {
    console.error("Error analyzing conversation insights:", error);
    return [];
  }
}

/**
 * Analyzes conversations to identify the typical user flow
 */
export async function analyzeConversationFlow(
  client: PoolClient,
  apiKey: string
): Promise<ConversationFlowStep[]> {
  try {
    // Get all conversations for this chatbot
    const result = await client.query(`
      SELECT 
        id,
        user_id,
        message_role,
        message_content,
        metadata,
        created_at
      FROM conversations
      WHERE api_key = $1
      ORDER BY created_at ASC
    `, [apiKey]);

    // For completely empty datasets, return empty array instead of mocked data
    if (result.rows.length === 0) {
      return [];
    }

    // Gather conversation content
    const userMessages = result.rows.filter(row => row.message_role === "user");
    const assistantMessages = result.rows.filter(row => row.message_role === "assistant");
    
    // Only create flow steps based on actual data detected in conversations
    const flow: ConversationFlowStep[] = [];
    let colorIndex = 0;
    
    // Product Inquiry detection
    const hasProductInquiry = userMessages.some(msg => 
      msg.message_content.toLowerCase().includes("product") || 
      msg.message_content.toLowerCase().includes("what") || 
      msg.message_content.toLowerCase().includes("how") ||
      msg.message_content.toLowerCase().includes("tell me about")
    );
    
    if (hasProductInquiry) {
      // Calculate a reasonable percentage based on how many messages contain product inquiries
      const inquiryCount = userMessages.filter(msg => 
        msg.message_content.toLowerCase().includes("product") || 
        msg.message_content.toLowerCase().includes("what") || 
        msg.message_content.toLowerCase().includes("how") ||
        msg.message_content.toLowerCase().includes("tell me about")
      ).length;
      
      const productInquiryPercentage = Math.round((inquiryCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "Product Inquiry",
        description: "Users ask about available products",
        percentage: Math.max(productInquiryPercentage, 5), // Ensure at least 5% for visual display
        color: FLOW_COLORS[colorIndex++]
      });
    }
    
    // Specific Product Questions detection
    const hasSpecificProduct = userMessages.some(msg => 
      (msg.metadata?.analysis?.entities?.product) ||
      (msg.message_content.toLowerCase().includes("iphone") || 
       msg.message_content.toLowerCase().includes("macbook") || 
       msg.message_content.toLowerCase().includes("this one"))
    );
    
    if (hasSpecificProduct) {
      // Calculate percentage based on specific product mentions
      const specificCount = userMessages.filter(msg => 
        (msg.metadata?.analysis?.entities?.product) ||
        (msg.message_content.toLowerCase().includes("iphone") || 
         msg.message_content.toLowerCase().includes("macbook") || 
         msg.message_content.toLowerCase().includes("this one"))
      ).length;
      
      const specificProductPercentage = Math.round((specificCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "Specific Product Questions",
        description: "Users request details about specific products",
        percentage: Math.max(specificProductPercentage, 5),
        color: FLOW_COLORS[colorIndex++ % FLOW_COLORS.length]
      });
    }
    
    // Add to Cart detection
    const hasAddToCart = result.rows.some(msg => 
      msg.metadata?.action?.type === "cart" && 
      msg.metadata?.action?.operation === "add"
    ) || userMessages.some(msg => 
      msg.message_content.toLowerCase().includes("add to cart") ||
      msg.message_content.toLowerCase().includes("buy")
    );
    
    if (hasAddToCart) {
      // Calculate percentage based on cart action messages
      const cartActionCount = userMessages.filter(msg => 
        msg.message_content.toLowerCase().includes("add to cart") ||
        msg.message_content.toLowerCase().includes("buy")
      ).length + result.rows.filter(msg => 
        msg.metadata?.action?.type === "cart" && 
        msg.metadata?.action?.operation === "add"
      ).length;
      
      const addToCartPercentage = Math.round((cartActionCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "Add to Cart",
        description: "Users add products to their shopping cart",
        percentage: Math.max(addToCartPercentage, 5),
        color: FLOW_COLORS[colorIndex++ % FLOW_COLORS.length]
      });
    }
    
    // View Cart detection
    const hasViewCart = result.rows.some(msg => 
      (msg.metadata?.navigationAction?.path === "/cart" || 
       msg.metadata?.action?.path === "/cart") ||
       msg.message_content.toLowerCase().includes("view cart") ||
       msg.message_content.toLowerCase().includes("show cart") ||
       msg.message_content.toLowerCase().includes("see cart")
    );
    
    if (hasViewCart) {
      // Calculate percentage based on view cart actions
      const viewCartCount = userMessages.filter(msg => 
        msg.message_content.toLowerCase().includes("view cart") ||
        msg.message_content.toLowerCase().includes("show cart") ||
        msg.message_content.toLowerCase().includes("see cart")
      ).length + result.rows.filter(msg => 
        msg.metadata?.navigationAction?.path === "/cart" || 
        msg.metadata?.action?.path === "/cart"
      ).length;
      
      const viewCartPercentage = Math.round((viewCartCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "View Cart",
        description: "Users request to view their cart",
        percentage: Math.max(viewCartPercentage, 5),
        color: FLOW_COLORS[colorIndex++ % FLOW_COLORS.length]
      });
    }
    
    // Checkout detection
    const hasCheckout = result.rows.some(msg => 
      (msg.metadata?.navigationAction?.path === "/checkout" || 
       msg.metadata?.action?.path === "/checkout") ||
       msg.message_content.toLowerCase().includes("checkout") ||
       msg.message_content.toLowerCase().includes("purchase")
    );
    
    if (hasCheckout) {
      // Calculate percentage based on checkout actions
      const checkoutCount = userMessages.filter(msg => 
        msg.message_content.toLowerCase().includes("checkout") ||
        msg.message_content.toLowerCase().includes("purchase")
      ).length + result.rows.filter(msg => 
        msg.metadata?.navigationAction?.path === "/checkout" || 
        msg.metadata?.action?.path === "/checkout"
      ).length;
      
      const checkoutPercentage = Math.round((checkoutCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "Checkout Process",
        description: "Users proceed to checkout",
        percentage: Math.max(checkoutPercentage, 5),
        color: FLOW_COLORS[colorIndex++ % FLOW_COLORS.length]
      });
    }
    
    // Login detection
    const hasLogin = result.rows.some(msg => 
      (msg.metadata?.navigationAction?.path === "/auth/login" || 
       msg.metadata?.action?.path === "/auth/login") ||
       msg.message_content.toLowerCase().includes("login") ||
       msg.message_content.toLowerCase().includes("log in") ||
       msg.message_content.toLowerCase().includes("sign in")
    );
    
    if (hasLogin) {
      // Calculate percentage based on login actions
      const loginCount = userMessages.filter(msg => 
        msg.message_content.toLowerCase().includes("login") ||
        msg.message_content.toLowerCase().includes("log in") ||
        msg.message_content.toLowerCase().includes("sign in")
      ).length + result.rows.filter(msg => 
        msg.metadata?.navigationAction?.path === "/auth/login" || 
        msg.metadata?.action?.path === "/auth/login"
      ).length;
      
      const loginPercentage = Math.round((loginCount / Math.max(userMessages.length, 1)) * 100);
      
      flow.push({
        step: "Login Request",
        description: "Users navigate to login page",
        percentage: Math.max(loginPercentage, 5),
        color: FLOW_COLORS[colorIndex++ % FLOW_COLORS.length]
      });
    }
    
    // Sort by percentage for better visualization
    flow.sort((a, b) => b.percentage - a.percentage);
    
    // Ensure percentages total 100% for better visualization
    if (flow.length > 0) {
      const totalPercentage = flow.reduce((sum, step) => sum + step.percentage, 0);
      
      // If total is not 100%, normalize it
      if (totalPercentage !== 100) {
        flow.forEach(step => {
          step.percentage = Math.round((step.percentage / totalPercentage) * 100);
          // Ensure minimum 5% for visibility
          if (step.percentage < 5) {
            step.percentage = 5;
          }
        });
      }
      
      // If we only have one flow step, it should be 100%
      if (flow.length === 1) {
        flow[0].percentage = 100;
      }
    }
    
    // Return flow steps - will be empty if no conversation data
    return flow;
  } catch (error) {
    console.error("Error analyzing conversation flow:", error);
    return [];
  }
}

// Fallback functions have been removed - we now only show real data

/**
 * Format intent name for better readability
 */
function formatIntentName(name: string): string {
  if (!name) return "Unknown";
  
  let formattedName = name.replace(/_/g, ' ');
  
  switch (formattedName) {
    case 'cart_add': return 'Add to Cart';
    case 'cart add': return 'Add to Cart';
    case 'cart_remove': return 'Remove from Cart';
    case 'cart remove': return 'Remove from Cart';
    case 'product_view': return 'View Product';
    case 'product view': return 'View Product';
    case 'navigate': return 'Navigation';
    case 'question': return 'Product Questions';
    case 'other': return 'Other Requests';
    default:
      return formattedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

/**
 * Format page name for better readability
 */
function formatPageName(path: string): string {
  if (!path) return "Unknown";
  
  // Remove leading slash and query params
  let cleanPath = path.replace(/^\//g, '').split('?')[0];
  
  switch (cleanPath.toLowerCase()) {
    case 'cart': return 'Cart';
    case 'checkout': return 'Checkout';
    case 'auth/login': return 'Login';
    case 'auth/signup': return 'Signup';
    case 'product': return 'Product';
    default:
      // Convert path segments to title case
      return cleanPath
        .split('/')
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
}