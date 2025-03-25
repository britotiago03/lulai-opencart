// /api/chat/route.ts
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const { 
  ASTRA_DB_NAMESPACE, 
  ASTRA_DB_API_ENDPOINT, 
  ASTRA_DB_APPLICATION_TOKEN, 
  OPENAI_API_KEY 
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function to initialize DB client
const initializeDB = () => {
  return new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN).db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
};

// Sanitize API key for collection names (matches loadDb.ts implementation)
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
    // Expecting both messages and apiKey in the request body
    const { messages, apiKey } = await req.json();
    if (!messages || !apiKey) {
      throw new Error("Missing required fields: messages and/or apiKey");
    }
    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      throw new Error("No message content provided.");
    }

    // Sanitize and create collection names
    const sanitizedKey = sanitizeApiKey(apiKey);
    const productCollectionName = `${sanitizedKey}_productlist`;
    const promptCollectionName = `${sanitizedKey}_prompt`;
    console.log(`Using collections for API key: ${sanitizedKey}`);
    
    // Get embedding for the latest message from OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: latestMessage,
      encoding_format: "float"
    });

    let docContext = "";
    let db = initializeDB(); // fresh DB connection per request

    try {
      const collection = await db.collection(productCollectionName);
      if (!collection) {
        throw new Error("Failed to retrieve product collection");
      }

      // Query documents with a retry mechanism
      let documents = [];
      let retries = 2;
      while (retries > 0) {
        try {
          const cursor = collection.find({}, {
            sort: { $vector: embedding.data[0].embedding },
            limit: 999
          });
          documents = await cursor.toArray();
          break;
        } catch (dbError: any) {
          console.error("Database query error:", dbError);
          if (dbError.message.includes("The session has been destroyed")) {
            console.warn("Reinitializing database connection...");
            db = initializeDB();
            retries--;
          } else {
            throw dbError;
          }
        }
      }

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
    } catch (dbError: any) {
      console.error("Final DB error:", dbError);
      docContext = "Error retrieving product data.";
    }

    // Load custom system prompt from the API key's prompt collection
    let customPrompt: string | null = null;
    try {
      const promptCollection = await db.collection(promptCollectionName);
      const promptDoc = await promptCollection.findOne({ id: "system_prompt" });
      if (promptDoc && promptDoc.content) {
        customPrompt = promptDoc.content;
      }
    } catch (error) {
      console.error("Error retrieving custom prompt:", error);
    }

    // Default system prompt guidelines (updated to use generic "API key" terminology)
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
   - Provide concise responses with clear product details
   - Offer relevant links when available`;

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
      model: "gpt-4o",
      stream: true,
      messages: [template, ...messages],
    });

    // Stream the response back to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiResponse) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              controller.enqueue(`data: ${JSON.stringify({ role: "assistant", content: delta.content })}\n\n`);
            }
          }
          controller.enqueue("data: {}\n\n");
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.error(streamError);
        }
        controller.close();
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