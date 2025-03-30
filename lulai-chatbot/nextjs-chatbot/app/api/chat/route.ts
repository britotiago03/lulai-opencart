import OpenAI from "openai";
import { Pool } from 'pg';
import 'dotenv/config';

const { OPENAI_API_KEY, DATABASE_URL } = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Sanitize API key for table names (matches loadDb.ts implementation)
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
    // Expecting messages, apiKey, and userId in the request body
    const { messages, apiKey, userId } = await req.json();
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
      // Log where it stored and what message was stored
      console.log(`Stored USER message in 'conversations' table for userId: ${userIdentifier}. Message: "${latestMessage}"`);
    } catch (dbError: any) {
      console.error("Error storing user message:", dbError);
      // Continue execution even if saving fails
    }

    // Get embedding for the latest message from OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: latestMessage,
      encoding_format: "float"
    });

    let docContext = "";
    let customPrompt: string | null = null;
    try {
      // Vector similarity search on products
      const { rows: documents } = await client.query(
        `SELECT * FROM ${productTableName}
         ORDER BY vector <=> $1
         LIMIT 999`,
        [JSON.stringify(embedding.data[0].embedding)]
      );

      if (!documents || documents.length === 0) {
        console.warn("No relevant documents found in database.");
        docContext = "No relevant products found.";
      } else {
        docContext = documents.map(doc => 
          `**Product Name**: ${doc.product_name}\n` +
          `**Price**: ${doc.price || "Not available"}\n` +
          `**Model**: ${doc.model || "Not available"}\n` +
          `**Category**: ${doc.category || "Not available"}\n` +
          `**Availability**: ${doc.availability || "Not available"}\n` +
          `**Description**: ${doc.text || "No description available"}\n` +
          `**Details**: ${doc.description_details || "No details available"}\n` +
          `**Specifications**: ${doc.description_specifications || "No specifications available"}\n` +
          `**URL**: [Link to Product](${doc.url || "#"})\n-----------------------------------\n`
        ).join("\n");
      }

      // Load custom system prompt from the prompt table
      const { rows } = await client.query(
        `SELECT content FROM ${promptTableName} WHERE id = $1`,
        ["system_prompt"]
      );
      customPrompt = rows[0]?.content || null;
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      docContext = "Error retrieving product data.";
    }

    // Default system prompt guidelines
    const defaultSystemPrompt = `You are a customer service chatbot designed to assist customers with questions related to this integration. 
Follow these guidelines:

1. Focus on Product Information:
   - Answer questions related to products, services, prices, availability, and categories using the provided context.
   - If product details are unavailable, be transparent while offering helpful suggestions.

2. Professional Tone:
   - Maintain a professional, friendly, and helpful tone at all times.
   - Avoid controversial or non-professional language.

3. Privacy Protection:
   - Immediately alert users if they share sensitive information.
   - Example response: "For your safety, please avoid sharing personal details through this channel."

4. Context Boundaries:
   - Politely decline to answer non-relevant questions with:
     "I'm specialized in product-related inquiries. How can I assist you with our offerings?"

5. Uncertainty Handling:
   - If lacking information, respond with:
     "I don't have specific details on that, but our products focus on quality and reliability. Check the product page for more information."

6. Clear Communication:
   - Provide concise responses with clear product details.
   - Offer relevant links when available.`;

    // Build the final system prompt
    const finalSystemPrompt = `${customPrompt || defaultSystemPrompt}
    
--------------
PRODUCT CONTEXT:
${docContext}
END CONTEXT
--------------
USER QUESTION: ${latestMessage}
--------------`;

    // Construct the system message template
    const template = {
      role: "system",
      content: finalSystemPrompt,
    };

    // OpenAI streaming response
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o", // Ensure this model name is correct; adjust if necessary.
      stream: true,
      messages: [template, ...messages],
    });

    // Variable to collect the complete assistant response
    let completeAssistantResponse = "";

    // Stream the response back to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiResponse) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              // Append to complete response
              completeAssistantResponse += delta.content;
              controller.enqueue(`data: ${JSON.stringify({ role: "assistant", content: delta.content })}\n\n`);
            }
          }
          
          // Store the complete assistant response in the database
          try {
            await client.query(
              `INSERT INTO conversations (api_key, user_id, message_role, message_content) 
               VALUES ($1, $2, $3, $4)`,
              [apiKey, userIdentifier, 'assistant', completeAssistantResponse]
            );
            // Log where it stored and what message was stored
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
