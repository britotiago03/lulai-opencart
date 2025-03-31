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
    const { messages, apiKey, userId, currentProduct } = await req.json();
    
    if (!messages || !apiKey) {
      throw new Error("Missing required fields: messages and/or apiKey");
    }
    
    // Use a default userId if none is provided
    const userIdentifier = userId || 'anonymous';
    
    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      throw new Error("No message content provided.");
    }

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

    // Get embedding for the latest message from OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: latestMessage,
      encoding_format: "float"
    });

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
   If the user is referring to the current product (the one they're viewing), use its ID. Otherwise, identify the specific product ID from the product context. Also if the user asks to put multiple different products into the cart at once or try to remove multiple different/all products from the cart let them know that you are only able to operate on one type of product at a time.`;

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

    // Combine prompts - if custom prompt exists, use it for behavior/guidelines, otherwise use default
    const behaviorPrompt = customPrompt || defaultBehaviorPrompt;

    // Build the final system prompt - Technical prompt + Behavior prompt + Context
    const finalSystemPrompt = `
${technicalSystemPrompt}

--------------
BEHAVIOR GUIDELINES:
${behaviorPrompt}
--------------

USER ANALYSIS:
Intent: ${analysis.intent || 'Unknown'}
Entities: ${JSON.stringify(analysis.entities || {})}
Sentiment: ${analysis.sentiment || 'Neutral'}
Recent conversation topics: ${recentIntents.map(i => i.intent).join(", ")}

${currentProductContext}
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
7. Follow the behavior guidelines while leveraging the technical capabilities to provide the best possible assistance.`;

    // Construct the system message template
    const template = {
      role: "system",
      content: finalSystemPrompt,
    };

    // OpenAI streaming response
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [template, ...messages],
    });

    // Variable to collect the complete assistant response
    let completeAssistantResponse = "";
    let cartAction = null;

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
                    if (parsed.action?.type === 'cart') {
                      cartAction = parsed.action;
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
          
          // Final message includes any detected cart action
          controller.enqueue(`data: ${JSON.stringify({ 
            role: "assistant", 
            content: "",
            action: cartAction,
            done: true
          })}\n\n`);
          
          // IMPROVED: Store response with intent analysis for future context improvement
          try {
            await client.query(
              `INSERT INTO conversations (api_key, user_id, message_role, message_content, metadata) 
               VALUES ($1, $2, $3, $4, $5)`,
              [apiKey, userIdentifier, 'assistant', completeAssistantResponse, JSON.stringify({
                analysis: analysis,
                cartAction: cartAction
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