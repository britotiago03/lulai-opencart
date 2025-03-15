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
    // Expecting both messages and storeName in the request body
    const { messages, storeName } = await req.json();
    if (!messages || !storeName) {
      throw new Error("Missing required fields: messages and/or storeName");
    }
    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      throw new Error("No message content provided.");
    }

    // Derive the collection name based on the store name (for example "Kitchen" => "store_kitchen", so just writing Kitchen will be enough)
    const collectionName = `store_${storeName.replace(/\s+/g, "_").toLowerCase()}`;
    console.log(`Using collection: ${collectionName}`);

    // Get embedding from OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: latestMessage,
      encoding_format: "float"
    });

    let docContext = "";
    let db = initializeDB(); // fresh DB connection per request

    try {
      const collection = await db.collection(collectionName);
      if (!collection) {
        throw new Error("Failed to retrieve collection");
      }

      // Perform query with a retry mechanism
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
        } catch (dbError) {
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
          `**Product Name**: ${doc.product_name}\n**Price**: ${doc.price || "Not available"}\n` +
          `**Model**: ${doc.model || "Not available"}\n**Category**: ${doc.category || "Not available"}\n` +
          `**Availability**: ${doc.availability || "Not available"}\n` +
          `**Description**: ${doc.text || "No description available"}\n` +
          `**Specifications**: ${doc.description_specifications || "No specifications available"}\n` +
          `**URL**: [Link to Product](${doc.url || "#"})\n-----------------------------------\n`
        ).join("\n");
      }
    } catch (dbError) {
      console.error("Final DB error:", dbError);
      docContext = "Error retrieving product data.";
    }

    // Construct system prompt including the document context
const template = {
  role: "system",
  content: `You are a customer service chatbot designed to assist customers with questions related to the store and its products. 
Follow these guidelines:

1. Focus on Product and Store Information:
   - Answer questions related to the store's products, services, prices, availability, categories, and general inquiries about the business.
   - If a product does not have enough context or information in the database, let the user know that the details are unavailable but offer a general response based on your knowledge.

2. Professional Tone:
   - Maintain a professional, friendly, and helpful tone at all times.
   - Avoid any language that might be interpreted as controversial, inappropriate, or non-professional. Respond to inquiries respectfully and courteously.

3. Handling Sensitive or Personal Information:
   - If a user shares personal or sensitive information, immediately inform them that they should avoid sharing such details through this platform.
   - For example, if someone shares their credit card number, home address, or personal details, reply with: "For your safety and privacy, please refrain from sharing personal or sensitive information through this chat."

4. Controversial or Off-Topic Questions:
   - If the user asks a controversial, political, or unrelated question, respond with: 
     "I'm here to help with questions regarding our products and services. If you need assistance with something related to our store, feel free to ask!"
   - Avoid engaging in any discussions that stray from customer service or product-related topics.

5. Product Uncertainty:
   - If a question about a product cannot be answered due to a lack of specific context, respond with something like:
     "I don't have enough information on that product right now, but I can tell you generally that our products are designed for quality and reliability. Feel free to check out the product page for more details."
   
6. Store Policies & Availability:
   - If asked about store policies, provide relevant, general information, such as return policies, shipping details, and operating hours (if available).
   - Be clear about stock availability and make sure to state if the product is in stock or out of stock.

7. Clear, Concise Responses:
   - Keep your responses clear, direct, and concise, without unnecessary elaboration.
   - If the user requires further information, offer links to product pages or relevant resources available in the store.

8. Empathy and Understanding:
   - Always be empathetic and understanding when responding, especially if the customer expresses frustration or dissatisfaction.
   - Offer solutions where appropriate and assure customers that you will do your best to assist them.

9. General Knowledge (Outside Context):
   - If a user asks for something outside of the store’s context, provide a general answer based on knowledge, but gently guide the conversation back to store-related matters.

10. Privacy and Data Security:
    - Always prioritize the customer’s privacy. If any sensitive data (like passwords or credit card information) is mentioned, advise the customer not to share such details in the chat for their own safety.

--------------
START CONTEXT:
${docContext}
END CONTEXT
--------------
QUESTION: ${latestMessage}
--------------
`
};


    // OpenAI streaming response
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [template, ...messages]
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
