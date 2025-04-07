import OpenAI from "openai";
import { Pool } from 'pg';
import 'dotenv/config';

const { OPENAI_API_KEY, DATABASE_URL } = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Sanitize API key for table names
const sanitizeApiKey = (apiKey: string) => {
  return apiKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// NEW: Helper function to map page names to their routes
function getPagePath(pageName: string): string | null {
  if (!pageName) return null;
  
  const normalizedName = pageName.toLowerCase().trim();
  
  const pageRoutes = {
    // Home page variations
    'home': '/',
    'homepage': '/',
    'main': '/',
    'main page': '/',
    'landing': '/',
    'landing page': '/',
    'front page': '/',
    
    // Cart variations
    'cart': '/cart',
    'shopping cart': '/cart',
    'my cart': '/cart',
    'view cart': '/cart',
    'basket': '/cart',
    
    // Checkout variations
    'checkout': '/checkout',
    'payment': '/checkout',
    'pay': '/checkout',
    'purchase': '/checkout',
    'complete purchase': '/checkout',
    'order completion': '/checkout',
    'finalize order': '/checkout',
    
    // Login variations
    'login': '/auth/login',
    'signin': '/auth/login',
    'sign in': '/auth/login',
    'log in': '/auth/login',
    'account': '/auth/login',
    'my account': '/auth/login',
    
    // Products/shop variations
    'products': '/products',
    'all products': '/products',
    'shop': '/products',
    'catalog': '/products',
    'browse': '/products',
    'store': '/products',
    'product list': '/products',
    'browse products': '/products'
  };
  
  return pageRoutes[normalizedName] || null;
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, apiKey, userId, context } = await req.json();
    
    if (!messages || !apiKey) {
      throw new Error("Missing required fields: messages and/or apiKey");
    }
    
    // Use a default userId if none is provided
    const userIdentifier = userId || 'anonymous';
    
    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      throw new Error("No message content provided.");
    }

    // Get current product context if available
    const currentProduct = context && context.currentProduct ? context.currentProduct : null;
    // Get last mentioned products if available
    const lastMentionedProducts = context && context.lastMentionedProducts ? context.lastMentionedProducts : [];
    
    // Sanitize and create table names
    const sanitizedKey = sanitizeApiKey(apiKey);
    const productTableName = `${sanitizedKey}_productlist`;
    const promptTableName = `${sanitizedKey}_prompt`;
    console.log(`Using tables for API key: ${sanitizedKey}`);

    // Store the user's message in the database
    const client = await pool.connect();
    
    try {
      // Save the latest user message to the conversations table
      await client.query(
        `INSERT INTO conversations (api_key, user_id, message_role, message_content) 
         VALUES ($1, $2, $3, $4)`,
        [apiKey, userIdentifier, 'user', latestMessage]
      );
      console.log(`Stored USER message in 'conversations' table for userId: ${userIdentifier}. Message: "${latestMessage}"`);
    } catch (dbError: any) {
      console.error("Error storing user message:", dbError);
      // Continue execution even if saving fails
    }

    // IMPROVED: Extract key entities and intents from the latest message
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the user's message and extract key entities, user intents, and sentiment. Format your output as JSON."
        },
        {
          role: "user",
          content: latestMessage
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the analysis
    const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");
    console.log("Message analysis:", analysis);

    // IMPROVED: More sophisticated intent detection for cart vs navigation actions
    const intentDetection = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this user message and determine the primary intent type. Is the user trying to:
1. Add a product to cart
2. View product details/navigate to a product page
3. Navigate to a website page (home, cart, checkout, login, products)
4. Ask a general question
5. Something else

Also determine if this is a direct action request or a response to a previous suggestion.
For example, if the message is just "yes" or "sure", it's likely responding to a previous suggestion.

Return your analysis as JSON with these fields:
- primaryIntent: "cart_add", "product_view", "navigate", "question", or "other"
- targetPage: string or null (for navigation intents: "home", "cart", "checkout", "login", "products")
- isResponseToSuggestion: boolean
- confidence: number between 0-1
- reasoning: brief explanation`
        },
        {
          role: "user",
          content: latestMessage
        }
      ],
      response_format: { type: "json_object" }
    });

    const intentAnalysis = JSON.parse(intentDetection.choices[0].message.content || "{}");
    console.log("Intent analysis:", intentAnalysis);

    // Add context from conversation history to help resolve ambiguous intents
    let lastAssistantMessage = "";
    try {
      const { rows } = await client.query(
        `SELECT message_content FROM conversations 
         WHERE api_key = $1 AND user_id = $2 AND message_role = 'assistant'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [apiKey, userIdentifier]
      );
      
      if (rows && rows.length > 0) {
        lastAssistantMessage = rows[0].message_content;
      }
    } catch (error) {
      console.error("Error fetching last assistant message:", error);
    }

    // Determine if the last assistant message contained a suggestion
    let lastSuggestion = null;
    if (lastAssistantMessage) {
      const suggestionDetection = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze this assistant message and determine if it contains a suggestion for the user to:
1. Add a product to cart
2. View a product page
3. Navigate to a website page (home, cart, checkout, login, products)
4. No specific suggestion

Return your analysis as JSON with these fields:
- suggestionType: "cart_add", "product_view", "site_navigation", or "none"
- targetPage: string or null (for site_navigation: "home", "cart", "checkout", "login", "products")
- confidence: number between 0-1`
          },
          {
            role: "user",
            content: lastAssistantMessage
          }
        ],
        response_format: { type: "json_object" }
      });
      
      lastSuggestion = JSON.parse(suggestionDetection.choices[0].message.content || "{}");
      console.log("Last suggestion analysis:", lastSuggestion);
    }
    // IMPROVED: Retrieve enhanced conversation history with timestamps and intents
    let conversationHistory = "";
    let recentIntents = [];
    try {
      // Get more context with timestamps (increased from 10 to 15 exchanges)
      const { rows: historyRows } = await client.query(
        `SELECT message_role, message_content, created_at
         FROM conversations 
         WHERE api_key = $1 AND user_id = $2
         ORDER BY created_at DESC 
         LIMIT 15`,
        [apiKey, userIdentifier]
      );
      
      if (historyRows && historyRows.length > 0) {
        // Format conversation history oldest to newest with timestamps
        const formattedHistory = historyRows
          .reverse()
          .map(row => {
            const timestamp = new Date(row.created_at).toISOString();
            return `[${timestamp}] ${row.message_role.toUpperCase()}: ${row.message_content}`;
          })
          .join("\n\n");
        
        conversationHistory = `
CONVERSATION HISTORY:
${formattedHistory}
END CONVERSATION HISTORY
`;
        console.log(`Retrieved ${historyRows.length} conversation history entries for userId: ${userIdentifier}`);
        
        // Extract recent user intents from history
        const userMessages = historyRows.filter(row => row.message_role === 'user').map(row => row.message_content);
        if (userMessages.length > 0) {
          // Get previous intents to understand ongoing conversation thread
          const intentAnalysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "Analyze these recent user messages and identify the main intents and topics being discussed. Return as JSON array of intent objects."
              },
              {
                role: "user",
                content: userMessages.join("\n--\n")
              }
            ],
            response_format: { type: "json_object" }
          });
          
          recentIntents = JSON.parse(intentAnalysis.choices[0].message.content || "{}").intents || [];
          console.log("Recent conversation intents:", recentIntents);
        }
      } else {
        console.log(`No conversation history found for userId: ${userIdentifier}`);
      }
    } catch (historyError: any) {
      console.error("Error retrieving conversation history:", historyError);
      // Continue execution even if history retrieval fails
    }

    // IMPROVED: Context retrieval
    let docContext = "";
    
    // Add current product context if available
    let currentProductContext = "";
    if (currentProduct) {
      currentProductContext = `
CURRENT PRODUCT:
The user is currently viewing this product:
ID: ${currentProduct.id}
Name: ${currentProduct.name || 'Unknown'}
Price: $${currentProduct.price?.toFixed(2) || 'Unknown'}
${currentProduct.description ? `Description: ${currentProduct.description}` : ''}
${currentProduct.category ? `Category: ${currentProduct.category}` : ''}
${currentProduct.specifications ? `Specifications: ${currentProduct.specifications}` : ''}

If the user asks to "add this to cart", "buy this", or similar phrases, they are referring to this product.
`;
    }

    // Add context for last mentioned products
    let mentionedProductsContext = "";
    if (lastMentionedProducts && lastMentionedProducts.length > 0) {
      mentionedProductsContext = `
RECENTLY MENTIONED PRODUCTS:
${lastMentionedProducts.map((product, index) => {
  return `Product ${index + 1}:
- Name/Text: ${product.text || 'Unknown'}
- URL: ${product.url || 'Unknown'}
- Product ID: ${product.productId || 'Unknown'}`;
}).join('\n\n')}

If the user says "take me there", "show me that", or similar phrases without specifying a product name, they are likely referring to one of these products.
`;
    }
    
    // NEW: Handle general site navigation requests (non-product pages)
    if (intentAnalysis.primaryIntent === "navigate" || 
        (intentAnalysis.targetPage && getPagePath(intentAnalysis.targetPage)) ||
        ((latestMessage.toLowerCase().includes("take me to") || 
          latestMessage.toLowerCase().includes("go to") ||
          latestMessage.toLowerCase().includes("show me") ||
          latestMessage.toLowerCase().includes("navigate to")) &&
         !latestMessage.toLowerCase().includes("product"))) {
      
      // First check if intent analysis already identified a target page
      let pageName = intentAnalysis.targetPage;
      let pagePath = pageName ? getPagePath(pageName) : null;
      
      // If not found in intent analysis, extract page name directly
      if (!pagePath) {
        const pageNameExtraction = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Extract the specific website page the user wants to navigate to.
Consider these options: home, cart, checkout, login, products.
Return just the page name (e.g., "cart" or "home") with no additional text.
If no specific page is mentioned or it's a product page request, return "NONE".`
            },
            {
              role: "user",
              content: latestMessage
            }
          ]
        });
        
        pageName = pageNameExtraction.choices[0].message.content?.trim();
        console.log("Extracted page name for navigation:", pageName);
        
        if (pageName && pageName !== 'NONE') {
          pagePath = getPagePath(pageName);
        }
      }
      
      // If we found a valid page, handle the navigation
      if (pageName && pagePath) {
        console.log(`Navigating to ${pageName} page at path: ${pagePath}`);
        
        const actionMsg = {
          role: "assistant",
          content: JSON.stringify({
            "response": `I'll take you to the ${pageName} page.`,
            "action": {
              "type": "navigate",
              "path": pagePath,
              "pageName": pageName
            }
          })
        };
        
        // Add to conversation history
        try {
          await client.query(
            `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
             VALUES ($1, $2, $3, $4, $5)`,
            [apiKey, userIdentifier, 'assistant', actionMsg.content, JSON.stringify({
              analysis: analysis,
              navigationAction: {
                "type": "navigate",
                "path": pagePath,
                "pageName": pageName
              }
            })]
          );
        } catch (error) {
          console.error("Error storing navigation action:", error);
        }
        
        // Return a navigation stream
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(`data: ${JSON.stringify({ 
              role: "assistant", 
              content: `I'll take you to the ${pageName} page.`,
              action: {
                "type": "navigate",
                "path": pagePath,
                "pageName": pageName
              }
            })}\n\n`);
            controller.enqueue("data: {}\n\n");
            controller.close();
          }
        });
        
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // IMPROVED: Better product search for navigation requests
    if ((intentAnalysis.primaryIntent === "product_view" || 
      (intentAnalysis.isResponseToSuggestion && lastSuggestion?.suggestionType === "product_view")) &&
      (latestMessage.toLowerCase().includes("take me") || 
       latestMessage.toLowerCase().includes("show me") || 
       latestMessage.toLowerCase().includes("go to"))) {
    
    // Extract product name from message
    const productNameExtraction = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract the specific product name the user wants to view. Return just the product name with no additional text."
        },
        {
          role: "user",
          content: latestMessage
        }
      ]
    });
      
    const productName = productNameExtraction.choices[0].message.content || "";
    console.log("Extracted product name for navigation:", productName);
    
    // Modified code starts here - prioritize the current request over historical context
    let productMatch = null;
    
    // IMPORTANT CHANGE 1: First attempt to find the explicitly mentioned product
    if (productName) {
      try {
        console.log("Searching for product by name:", productName);
        // Improve the search query to better match product names
        const { rows } = await client.query(
          `SELECT * FROM ${productTableName} 
           WHERE LOWER(product_name) LIKE LOWER($1)
           ORDER BY LENGTH(product_name) ASC
           LIMIT 1`,
          [`%${productName}%`]
        );
        
        if (rows && rows.length > 0) {
          console.log("Found product match for:", productName, rows[0]);
          productMatch = {
            id: rows[0].id || rows[0].product_id,
            name: rows[0].product_name,
            url: rows[0].url || `/product/${rows[0].id || rows[0].product_id}`
          };
        } else {
          console.log("No product found with name:", productName);
        }
      } catch (error) {
        console.error("Error finding product by name:", error);
      }
    }
    
    // Only fall back to context products if no direct match was found
    if (!productMatch && lastMentionedProducts.length > 0) {
      console.log("No direct match found, checking last mentioned products:", lastMentionedProducts);
      if (lastMentionedProducts[0].productId) {
        productMatch = {
          id: lastMentionedProducts[0].productId,
          name: lastMentionedProducts[0].text,
          url: lastMentionedProducts[0].url
        };
      }
    }
      
      // If no product in context but we have current product, use that as fallback
      if (!productMatch && currentProduct) {
        productMatch = {
          id: currentProduct.id,
          name: currentProduct.name,
          url: `/product/${currentProduct.id}`
        };
      }
      
      // If still no match and we have a product name, search for it
      if (!productMatch && productName) {
        try {
          // Direct lookup by name
          const { rows } = await client.query(
            `SELECT * FROM ${productTableName} 
             WHERE LOWER(product_name) LIKE LOWER($1)
             LIMIT 1`,
            [`%${productName}%`]
          );
          
          if (rows && rows.length > 0) {
            productMatch = {
              id: rows[0].id || rows[0].product_id,
              name: rows[0].product_name,
              url: rows[0].url || `/product/${rows[0].id || rows[0].product_id}`
            };
          }
        } catch (error) {
          console.error("Error finding product by name:", error);
        }
      }
      
      // If we found a product to navigate to, prepare the navigation action
      if (productMatch) {
        // This will be processed as a navigation request
        const path = productMatch.url.includes('/product/') 
          ? productMatch.url 
          : `/product/${productMatch.id}`;
          
        const actionMsg = {
          role: "assistant",
          content: JSON.stringify({
            "response": `I'll take you to the ${productMatch.name} page.`,
            "action": {
              "type": "navigate",
              "path": path,
              "productId": productMatch.id,
              "productName": productMatch.name
            }
          })
        };
        
        // Add to conversation history
        try {
          await client.query(
            `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
             VALUES ($1, $2, $3, $4, $5)`,
            [apiKey, userIdentifier, 'assistant', actionMsg.content, JSON.stringify({
              analysis: analysis,
              navigationAction: {
                "type": "navigate",
                "path": path,
                "productId": productMatch.id
              }
            })]
          );
        } catch (error) {
          console.error("Error storing navigation action:", error);
        }
        
        // Return a navigation stream
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(`data: ${JSON.stringify({ 
              role: "assistant", 
              content: `I'll take you to the ${productMatch.name} page.`,
              action: {
                "type": "navigate",
                "path": path,
                "productId": productMatch.id,
                "productName": productMatch.name
              }
            })}\n\n`);
            controller.enqueue("data: {}\n\n");
            controller.close();
          }
        });
        
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    
    // IMPROVED: Enhanced product search with intent-based boosting
    try {
      // Extract keywords based on current user intents
      const keywordExtraction = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Extract 3-5 most important search keywords from this user query for product retrieval."
          },
          {
            role: "user",
            content: `${latestMessage}\n\nRecent context: ${recentIntents.map(i => i.intent).join(", ")}`
          }
        ]
      });
      
      const extractedKeywords = keywordExtraction.choices[0].message.content || "";
      console.log("Extracted keywords for search:", extractedKeywords);
      
      // Get embedding for enhanced search keywords
      const enhancedEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: `${latestMessage} ${extractedKeywords}`,
        encoding_format: "float"
      });
      
      // IMPROVED: Multi-search approach - vector similarity + categorical filtering
      let queryConditions = "ORDER BY vector <=> $1 LIMIT 7";
      
      // Add category filtering if identified in message analysis
      if (analysis.entities && analysis.entities.categories) {
        const categories = analysis.entities.categories;
        if (categories.length > 0) {
          const categoryList = categories.map(c => `'${c.toLowerCase()}'`).join(',');
          queryConditions = `WHERE LOWER(category) IN (${categoryList}) ORDER BY vector <=> $1 LIMIT 7`;
        }
      }

      function extractProductNameFromNavigationRequest(message) {
        // Remove common navigation phrases to isolate product name
        let cleanMessage = message.toLowerCase()
          .replace(/take me to/g, '')
          .replace(/go to/g, '')
          .replace(/show me/g, '')
          .replace(/the/g, '')
          .replace(/page/g, '')
          .trim();
        
        console.log("Cleaned navigation message:", cleanMessage);
        return cleanMessage;
      }
      
      // Execute the enhanced search
      const { rows: documents } = await client.query(
        `SELECT * FROM ${productTableName} ${queryConditions}`,
        [JSON.stringify(enhancedEmbedding.data[0].embedding)]
      );

      if (!documents || documents.length === 0) {
        console.warn("No relevant documents found in database.");
        docContext = "No relevant products found. However, we have many other options available.";
      } else {
        // IMPROVED: Better product representation with highlights based on user intent
        docContext = documents.map(doc => {
          // Highlight features that match user intent
          let highlights = "";
          if (analysis.intent) {
            const intent = analysis.intent.toLowerCase();
            
            if (intent.includes("price") || intent.includes("cost") || intent.includes("budget")) {
              highlights += `**SPECIAL OFFER**: This product is ${doc.on_sale ? 'currently on sale!' : 'competitively priced.'}\n`;
            }
            
            if (intent.includes("feature") || intent.includes("capability")) {
              highlights += `**KEY FEATURES**: ${doc.features || doc.highlights || "Quality product with great functionality."}\n`;
            }
            
            if (intent.includes("compare") || intent.includes("difference")) {
              highlights += `**COMPARED TO SIMILAR PRODUCTS**: ${doc.comparison || "This product offers excellent value in its category."}\n`;
            }
          }
          
          return `**Product Name**: ${doc.product_name}\n` +
            `**Product ID**: ${doc.id || doc.product_id || "Not available"}\n` +
            `**Price**: ${doc.price || "Not available"}\n` +
            `**Model**: ${doc.model || "Not available"}\n` +
            `**Category**: ${doc.category || "Not available"}\n` +
            `**Availability**: ${doc.availability || "Not available"}\n` +
            (highlights ? `${highlights}` : '') +
            `**Description**: ${doc.text || "No description available"}\n` +
            `**Details**: ${doc.description_details || "No details available"}\n` +
            `**Specifications**: ${doc.description_specifications || "No specifications available"}\n` +
            `**URL**: [Link to Product](${doc.url || "#"})\n-----------------------------------\n`;
        }).join("\n");
      }
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      docContext = "Error retrieving product data.";
    }

    // Fetch custom prompt if available
    let customPrompt = "";
    try {
      const { rows } = await client.query(
        `SELECT content FROM ${promptTableName} WHERE id = 'system_prompt' LIMIT 1`
      );
      
      if (rows && rows.length > 0) {
        customPrompt = rows[0].content;
        console.log(`Retrieved custom prompt for API key: ${apiKey}`);
      } else {
        console.log(`No custom prompt found for API key: ${apiKey}, using default system prompt only.`);
      }
    } catch (promptError: any) {
      console.error("Error retrieving custom prompt:", promptError);
      // Continue execution with default system prompt
    }

    // IMPROVED: Technical system prompt with core functionality (always used)
    const technicalSystemPrompt = `
This is a technical system prompt that defines the core functionality and capabilities:

1. Context Understanding:
   - You have enhanced context understanding with message analysis, intent recognition, and timestamp-aware conversation history.
   - Your responses should demonstrate awareness of the conversation flow and recognize shifts in user focus.

2. Product Search Capabilities:
   - You have access to a product database with intelligent search capabilities using keyword extraction and vector similarity.
   - Product context is organized to highlight the most relevant information based on user intent.
   - When products are found, prioritize information that matches the user's detected intent.

3. Processing Guidelines:
   - Always identify cart-related actions using the JSON structure format defined below.
   - Monitor for and extract metadata that can improve future interactions.
   - Maintain consistency between current and previous exchanges.

4. Cart Action Detection:
   If the user wants to add, remove, update a product in cart, identify the specific product and respond with a cart action in your response using this format:
   {
     "response": "Your helpful response to the user",
     "action": {
       "type": "cart",
       "operation": "add" or "remove" or "update",
       "productId": 123,
       "quantity": 1 (required for add/update operations)
     }
   }
   If the user is referring to the current product (the one they're viewing), use its ID. Otherwise, identify the specific product ID from the product context. Also if the user asks to put multiple different products into the cart at once or try to remove multiple different/all products from the cart let them know that you are only able to operate on one type of product at a time.
   
5. Navigation Intent Detection:
   If the user wants to navigate to a product page or follow up on a product you've suggested, respond with a navigation action using this format:
   {
     "response": "Your helpful response to the user",
     "action": {
       "type": "navigate",
       "path": "/product/123", 
       "productId": 123,
       "productName": "Product name"
     }
   }
   Only use the navigation action when you are confident the user wants to visit the specific product page.
   Do NOT use navigation action for:
   - General product inquiries like "How much does it cost?" or "Tell me more about this" 
   - Questions about product features, specs, or comparisons
   - Any message that requires you to provide information rather than navigate
   
   Important: Prioritize answering the user's actual question over suggesting navigation. Only suggest navigation when the user's intent is clearly to view the product page.

6. Enhanced Site Navigation:
   The chatbot can navigate to the following pages:
   - Home page: /
   - Cart: /cart
   - Login: /auth/login
   - All products: /products 
   - Checkout: /checkout
   - Specific product: /product/{id}

   If the user wants to navigate to a general website page (non-product), respond with a navigation action using this format:
   {
     "response": "I'll take you to the [Page Name] page.",
     "action": {
       "type": "navigate",
       "path": "/path/to/page",
       "pageName": "Page Name"
     }
   }

   For example, if the user says "Take me to the cart", respond with:
   {
     "response": "I'll take you to the cart page.",
     "action": {
       "type": "navigate",
       "path": "/cart",
       "pageName": "cart"
     }
   }

   Common navigation intent phrases include:
   - "Take me to [page]"
   - "Go to [page]"
   - "I want to see my [page]"
   - "Show me [page]"
   - "Open [page]"
   - "Navigate to [page]"

7. User Intent Recognition:
   - Recognize navigation intents in user messages such as "yes", "take me there", "show me", etc.
   - When a user expresses intent to visit a page, acknowledge their request positively
   - If the user asks to "see the product" or similar phrases, interpret this as interest in visiting the product page
   - For ambiguous phrases, prioritize answering questions over actions
   `;

    // Default system prompt guidelines - this is used if no custom prompt is available
    const defaultBehaviorPrompt = `You are a customer service chatbot designed to assist customers with questions related to this integration. 
Follow these guidelines:

1. Focus on Product Information:
   - Answer questions related to products, services, prices, availability, and categories using the provided context.
   - If product details are unavailable, be transparent while offering helpful suggestions.

2. Professional Tone:
   - Maintain a professional, friendly, and helpful tone at all times.
   - Reference conversation history when relevant to show continuity.
   - Adapt your communication style to match the user's formality level.

3. Privacy Protection:
   - Immediately alert users if they share sensitive information.
   - Example response: "For your safety, please avoid sharing personal details through this channel."

4. Context Awareness:
   - Reference previous conversations when relevant to show continuity.
   - Recognize when a user is returning to a previous topic.
   - Identify and respond to shifts in conversation focus.

5. Uncertainty Handling:
   - If lacking information, respond with:
     "I don't have specific details on that, but our products focus on quality and reliability. Check the product page for more information."
   - Provide alternatives that might meet the user's needs.

6. Clear Communication:
   - Provide concise responses with clear product details.
   - Prioritize information based on detected user intent.
   - Offer relevant links when available.`;

    // Enhanced behavior prompt with better intent handling
    const enhancedBehaviorSection = `
IMPORTANT BEHAVIOR IMPROVEMENTS:

1. Resolving Ambiguous User Responses:
   - When a user responds with just "yes", "sure", or similar affirmative answers:
     * Check if you previously suggested adding to cart → interpret as cart operation
     * Check if you previously suggested viewing a product → interpret as navigation request
     * If unclear, ask for clarification: "Would you like to view the product details or add it to your cart?"

2. Clear Action Suggestions:
   - When suggesting products, clearly separate navigation and cart options:
     * "Would you like to view more details about [Product] or add it to your cart?"
     * Always phrase as a question when suggesting actions

3. Context Preservation:
   - Maintain context about which action the user is responding to
   - If user was discussing a specific product, assume operations refer to that product

4. Differentiating Between Questions and Actions:
   - Phrases with "buy it", "cost", "price" without explicit "add to cart" are likely questions, not cart actions
   - Messages with "how much" or "tell me about" are information requests, not action requests
   - Only use navigation or cart actions when the user's primary intent is to perform that action

Current intent analysis: ${JSON.stringify(intentAnalysis)}
Last assistant suggestion: ${lastSuggestion ? JSON.stringify(lastSuggestion) : "None"}

If user said "${latestMessage}" and it appears to be responding to a previous suggestion:
${intentAnalysis.isResponseToSuggestion ? 
  `- Interpret based on your last suggestion (${lastSuggestion?.suggestionType || "unknown"})` : 
  "- Treat as a new request"}
`;

    // Navigation behavior guidelines
    const navigationBehaviorGuidelines = `
NAVIGATION HANDLING GUIDELINES:

1. When a user requests to view a product:
   - If they mention a specific product name (e.g., "iPhone", "MacBook Air"), use that name in the navigation response
   - If they say "take me there" or "show me that", use the last mentioned product
   - If they're viewing a product and say "let me see it", use the current product

2. Navigation response format:
   Always format navigation actions consistently:
   {
     "response": "I'll take you to the [Product Name] page.",
     "action": {
       "type": "navigate",
       "path": "/product/123",
       "productId": 123,
       "productName": "Product Name"
     }
   }

3. Handling ambiguous navigation requests:
   - If you cannot determine which product to navigate to, ask for clarification
   - When suggesting a product, include its name explicitly: "Would you like to see the iPhone 15?"
   - Never send a navigation action to "/404" or an invalid page

4. Site-wide navigation:
   When a user requests to view a common website page (not a product):
   - Recognize requests for Home, Cart, Login, Products and Checkout pages
   - Format navigation actions to these pages exactly as you would for product pages
   - Include the "pageName" field to help contextualize the navigation target
   - For ambiguous requests, ask for clarification before navigating
`;

    // Combine prompts - if custom prompt exists, use it for behavior/guidelines, otherwise use default
    const behaviorPrompt = customPrompt || defaultBehaviorPrompt;

    // Build the final system prompt - Technical prompt + Behavior prompt + Context
    const finalSystemPrompt = `
${technicalSystemPrompt}

--------------
BEHAVIOR GUIDELINES:
${behaviorPrompt}

${enhancedBehaviorSection}

${navigationBehaviorGuidelines}
--------------

USER ANALYSIS:
Intent: ${analysis.intent || 'Unknown'}
Entities: ${JSON.stringify(analysis.entities || {})}
Sentiment: ${analysis.sentiment || 'Neutral'}
Recent conversation topics: ${recentIntents.map(i => i.intent).join(", ")}

${currentProductContext}
${mentionedProductsContext}
PRODUCT CONTEXT:
${docContext}

${conversationHistory}
--------------
USER QUESTION: ${latestMessage}
--------------

IMPORTANT CONTEXT GUIDELINES:
1. Make use of the conversation history to provide context-aware responses. Maintain consistency with previous exchanges.
2. Reference past interactions when relevant to show continuity in the conversation.
3. Recognize when user is comparing products, seeking recommendations, or ready to purchase.
4. Adapt your level of detail based on conversation context - provide more detailed specs for technically-oriented discussions.
5. Use the extracted intent and entities to prioritize the most relevant information in your response.
6. Maintain awareness of the conversation flow and respond accordingly to shifts in focus or topic.
7. Follow the behavior guidelines while leveraging the technical capabilities to provide the best possible assistance.
8. If user appears to be saying "yes" to a previous suggestion, respond appropriately based on what was suggested (cart operation or navigation).`;

    // Construct the system message template
    const template = {
      role: "system",
      content: finalSystemPrompt,
    };

    // IMPROVED: Handle special cases for "yes" responses to cart or navigation suggestions
    // If it's a high-confidence response to a suggestion and we know the suggestion type
    if (intentAnalysis.isResponseToSuggestion && 
        intentAnalysis.confidence > 0.7 && 
        lastSuggestion && 
        lastSuggestion.suggestionType !== "none" &&
        lastSuggestion.confidence > 0.7) {
      
      // NEW: Handle response to site navigation suggestion
      if (lastSuggestion.suggestionType === "site_navigation" && lastSuggestion.targetPage) {
        const pageName = lastSuggestion.targetPage;
        const pagePath = getPagePath(pageName);
        
        if (pagePath) {
          console.log(`Navigating to ${pageName} page based on previous suggestion`);
          
          const actionMsg = {
            role: "assistant",
            content: JSON.stringify({
              "response": `I'll take you to the ${pageName} page.`,
              "action": {
                "type": "navigate",
                "path": pagePath,
                "pageName": pageName
              }
            })
          };
          
          // Add this navigation action to conversation history
          try {
            await client.query(
              `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
                VALUES ($1, $2, $3, $4, $5)`,
              [apiKey, userIdentifier, 'assistant', actionMsg.content, JSON.stringify({
                analysis: analysis,
                navigationAction: {
                  "type": "navigate",
                  "path": pagePath,
                  "pageName": pageName
                }
              })]
            );
          } catch (error) {
            console.error("Error storing navigation action response:", error);
          }
          
          // Return a special stream with just this navigation action message
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(`data: ${JSON.stringify({ 
                role: "assistant", 
                content: `I'll take you to the ${pageName} page.`,
                action: {
                  "type": "navigate",
                  "path": pagePath,
                  "pageName": pageName
                }
              })}\n\n`);
              controller.enqueue("data: {}\n\n");
              controller.close();
            }
          });
          
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
      
      // If it was a response to a cart suggestion, explicitly format a cart action
      if (lastSuggestion.suggestionType === "cart_add" && currentProduct) {
        const cartProductId = currentProduct.id;
        const actionMsg = {
          role: "assistant",
          content: JSON.stringify({
            "response": `I'll add the ${currentProduct.name} to your cart right away. Would you like to continue shopping?`,
            "action": {
              "type": "cart",
              "operation": "add",
              "productId": cartProductId,
              "quantity": 1
            }
          })
        };
        
        // Add this cart operation to the conversation history
        try {
          await client.query(
            `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
             VALUES ($1, $2, $3, $4, $5)`,
            [apiKey, userIdentifier, 'assistant', actionMsg.content, JSON.stringify({
              analysis: analysis,
              cartAction: {
                "type": "cart",
                "operation": "add",
                "productId": cartProductId,
                "quantity": 1
              }
            })]
          );
        } catch (error) {
          console.error("Error storing cart action response:", error);
        }
        
        // Return a special stream with just this cart action message
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(`data: ${JSON.stringify({ 
              role: "assistant", 
              content: `I'll add the ${currentProduct.name} to your cart right away.`,
              action: {
                "type": "cart",
                "operation": "add",
                "productId": cartProductId,
                "quantity": 1
              }
            })}\n\n`);
            controller.enqueue("data: {}\n\n");
            controller.close();
          }
        });
        
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      
      // Handle navigation suggestion responses
      if (lastSuggestion.suggestionType === "product_view") {
        // Extract product ID from the last messages
        let targetProductId = null;
        let productName = "this product";
        let productPath = "";
        
        // First check if we have product info in context
        if (lastMentionedProducts && lastMentionedProducts.length > 0) {
          const contextProduct = lastMentionedProducts[0];
          if (contextProduct.productId) {
            targetProductId = contextProduct.productId;
            productName = contextProduct.text || "this product";
            productPath = contextProduct.url || `/product/${targetProductId}`;
            
            // Make sure path starts with /product/ for consistency
            if (!productPath.includes('/product/')) {
              productPath = `/product/${targetProductId}`;
            }
          }
        }
        
        // If no product in context, try to extract from last assistant message
        if (!targetProductId) {
          try {
            // Get the last assistant message to find product links
            const { rows } = await client.query(
              `SELECT message_content FROM conversations 
               WHERE api_key = $1 AND user_id = $2 AND message_role = 'assistant'
               ORDER BY created_at DESC 
               LIMIT 1`,
              [apiKey, userIdentifier]
            );
            
            if (rows && rows.length > 0) {
              const content = rows[0].message_content;
              
              // Extract product ID from markdown links like [Product Name](/product/123)
              const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
              if (linkMatch) {
                productName = linkMatch[1];
                productPath = linkMatch[2];
                
                const idMatch = productPath.match(/\/product\/(\d+)/);
                if (idMatch) {
                  targetProductId = parseInt(idMatch[1], 10);
                }
              }
            }
          } catch (error) {
            console.error("Error finding product to navigate to:", error);
          }
        }
        
        // If still no product, fall back to current product if available
        if (!targetProductId && currentProduct) {
          targetProductId = currentProduct.id;
          productName = currentProduct.name;
          productPath = `/product/${targetProductId}`;
        }
        
        if (targetProductId && productPath) {
          // Add this logging before navigation
          console.log("NAVIGATION ACTION DETAILS:");
          console.log("- Requested product: " + productName);
          console.log("- Navigation to product ID: " + targetProductId);
          console.log("- Product name: " + productName);
          console.log("- Path: " + productPath);
          
          const actionMsg = {
            role: "assistant",
            content: JSON.stringify({
              "response": `I'll take you to the ${productName} page.`,
              "action": {
                "type": "navigate",
                "path": productPath,
                "productId": targetProductId,
                "productName": productName
              }
            })
          };
          
          // Add this navigation action to conversation history
          try {
            await client.query(
              `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
               VALUES ($1, $2, $3, $4, $5)`,
              [apiKey, userIdentifier, 'assistant', actionMsg.content, JSON.stringify({
                analysis: analysis,
                navigationAction: {
                  "type": "navigate",
                  "path": productPath,
                  "productId": targetProductId
                }
              })]
            );
          } catch (error) {
            console.error("Error storing navigation action response:", error);
          }
          
          // Return a special stream with just this navigation action message
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(`data: ${JSON.stringify({ 
                role: "assistant", 
                content: `I'll take you to the ${productName} page.`,
                action: {
                  "type": "navigate",
                  "path": productPath,
                  "productId": targetProductId,
                  "productName": productName
                }
              })}\n\n`);
              controller.enqueue("data: {}\n\n");
              controller.close();
            }
          });
          
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
    }

    // Handle direct navigation requests
    if (intentAnalysis.primaryIntent === "product_view" && 
        (latestMessage.toLowerCase().includes("take me") || 
         latestMessage.toLowerCase().includes("go to") ||
         latestMessage.toLowerCase().includes("show me"))) {
      
      // Product navigation handling code remains unchanged
    }

    // For standard cases, proceed with OpenAI streaming response
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [template, ...messages],
    });

    // Variable to collect the complete assistant response
    let completeAssistantResponse = "";
    let actionObject = null;

    // Stream the response back to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiResponse) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              // Append to complete response
              completeAssistantResponse += delta.content;
              
              // Check if we have a complete JSON with action
              try {
                if (completeAssistantResponse.includes('"action"')) {
                  const match = completeAssistantResponse.match(/\{[\s\S]*"action"[\s\S]*\}/);
                  if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (parsed.action) {
                      actionObject = parsed.action;
                      // Just send the regular text without the JSON structure
                      completeAssistantResponse = parsed.response || completeAssistantResponse;
                    }
                  }
                }
              } catch (e) {
                // Parsing not complete yet, continue
              }
              
              controller.enqueue(`data: ${JSON.stringify({ 
                role: "assistant", 
                content: delta.content
              })}\n\n`);
            }
          }
          
          // Final message includes any detected action
          controller.enqueue(`data: ${JSON.stringify({ 
            role: "assistant", 
            content: "",
            action: actionObject,
            done: true
          })}\n\n`);
          
          // IMPROVED: Store response with intent analysis for future context improvement
          try {
            await client.query(
              `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
               VALUES ($1, $2, $3, $4, $5)`,
              [apiKey, userIdentifier, 'assistant', completeAssistantResponse, JSON.stringify({
                analysis: analysis,
                action: actionObject,
                intentAnalysis: intentAnalysis,
                lastSuggestion: lastSuggestion
              })]
            );
            console.log(`Stored ASSISTANT message in 'conversations' table for userId: ${userIdentifier}. Message: "${completeAssistantResponse}"`);
          } catch (saveError) {
            console.error("Error storing assistant response:", saveError);
          } finally {
            // Always release the client back to the pool
            client.release();
          }
          
          controller.enqueue("data: {}\n\n");
        } catch (streamError) {
          console.error("Stream error:", streamError);
          client.release();
          controller.error(streamError);
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}