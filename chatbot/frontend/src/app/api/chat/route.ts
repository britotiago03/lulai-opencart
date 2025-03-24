import { NextResponse } from "next/server";
import { Pool } from "pg";
import OpenAI from "openai";

// Initialize OpenAI and PostgreSQL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pool = new Pool({ connectionString: DATABASE_URL });

export async function POST(req: Request) {
    try {
        const { sessionId, message } = await req.json();

        if (!sessionId || !message) {
            return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
        }

        // Get session data to determine the source type
        const sessionData = await getSessionDataFromDb(sessionId);
        const sourceType = sessionData?.type || 'json-upload'; // Default to JSON if not found

        // Retrieve relevant content based on the user query
        let contextData;
        if (sourceType === 'web-scrape') {
            contextData = await getRelevantScrapedContent(message, sessionId);
        } else {
            contextData = await getRelevantProducts(message);
        }

        // Build the system prompt with appropriate context
        let systemPrompt;

        if (sourceType === 'web-scrape') {
            systemPrompt = `
You are an AI assistant trained on website content. You help users find information and answer questions based on the scraped website data.

Here's the relevant content from the website that may help answer the user's question:
${JSON.stringify(contextData, null, 2)}

When providing information:
1. Base your answers primarily on the provided context.
2. If the information requested is not present in the context, acknowledge this limitation.
3. Format your responses clearly with appropriate headings and sections when needed.
4. If the user asks about sending information via email, ask "Would you like this information sent to your email?" and wait for their response.
`;
        } else {
            // For JSON product data
            systemPrompt = `
You are an AI shopping assistant that helps users find recipes and products. 
You have access to product information from a grocery store.
Here's the product data you can reference:
${JSON.stringify(contextData, null, 2)}

When suggesting recipes, use only ingredients that are available in the product data.
When listing ingredients for a recipe, always include:
- Product Name
- Weight/Volume
- Origin (if available)
- Price
- Aisle (if available)

Format your responses clearly with proper sections and when using a list instead of using "1." use "1- ".
If the user asks about sending the information via email, ask "Would you like this list sent to your email?" and wait for their response.
`;
        }

        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4o",  // Use an appropriate model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        const responseContent = chatResponse.choices[0].message.content || "I'm not sure how to respond to that.";

        return NextResponse.json({
            response: responseContent
        });
    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred" },
            { status: 500 }
        );
    }
}

// Get session data from database or localStorage (simulated here)
async function getSessionDataFromDb(sessionId: string) {
    try {
        // This is a placeholder - in a real implementation, you might store session data in your database
        // For simplicity, determine type based on session ID format
        return {
            id: sessionId,
            type: sessionId.includes('scrape') ? 'web-scrape' : 'json-upload'
        };
    } catch (error) {
        console.error("Error retrieving session data:", error);
        return null;
    }
}

// Function to retrieve relevant products for the JSON upload path
async function getRelevantProducts(query: string) {
    try {
        // Generate embeddings for the query
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
            encoding_format: "float",
        });

        const queryEmbedding = embeddings.data[0].embedding;

        // Use the embeddings to find relevant products in PostgreSQL using vector similarity
        const client = await pool.connect();
        try {
            // Convert embedding array to PostgreSQL vector format
            const embeddingString = `[${queryEmbedding.join(',')}]`;

            // Use vector similarity search to find relevant products
            const result = await client.query(`
                SELECT 
                    id, name, price, sku, model, image, type, 
                    availability, currency, weight_or_size as "weightOrSize", 
                    origin, aisle,
                    embedding <-> $1 as distance
                FROM products
                ORDER BY distance ASC
                LIMIT 20;
            `, [embeddingString]);

            // If no results from vector search, return a generic response
            if (result.rows.length === 0) {
                return await getFallbackProducts(client);
            }

            return result.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error retrieving products:", error);
        return []; // Return empty array if retrieval fails
    }
}

// Function to retrieve relevant content for the web scrape path
async function getRelevantScrapedContent(query: string, sessionId: string) {
    try {
        // Generate embeddings for the query
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
            encoding_format: "float",
        });

        const queryEmbedding = embeddings.data[0].embedding;

        // Use the embeddings to find relevant content in PostgreSQL using vector similarity
        const client = await pool.connect();
        try {
            // Convert embedding array to PostgreSQL vector format
            const embeddingString = `[${queryEmbedding.join(',')}]`;

            // Use vector similarity search to find relevant content for this session
            const result = await client.query(`
                SELECT 
                    id, url, title, content, content_type,
                    metadata,
                    embedding <-> $1 as distance
                FROM scraped_content
                WHERE session_id = $2
                ORDER BY distance ASC
                LIMIT 10;
            `, [embeddingString, sessionId]);

            // If no results from vector search, return all content from this session
            if (result.rows.length === 0) {
                return await getFallbackScrapedContent(sessionId, client);
            }

            return result.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error retrieving scraped content:", error);
        return []; // Return empty array if retrieval fails
    }
}

// Fallback function to get any content from the scraper session if vector search fails
async function getFallbackScrapedContent(sessionId: string, client: any) {
    try {
        const result = await client.query(`
            SELECT id, url, title, content, content_type, metadata
            FROM scraped_content 
            WHERE session_id = $1
            LIMIT 10
        `, [sessionId]);

        return result.rows;
    } catch (error) {
        console.error("Error getting fallback scraped content:", error);
        return [];
    }
}

// Fallback function to get any products if vector search fails
async function getFallbackProducts(client: any) {
    try {
        const result = await client.query(`
            SELECT id, name, price, sku, model, image, type, 
                   availability, currency, weight_or_size as "weightOrSize", 
                   origin, aisle
            FROM products
            LIMIT 20
        `);

        return result.rows;
    } catch (error) {
        console.error("Error getting fallback products:", error);
        return [];
    }
}