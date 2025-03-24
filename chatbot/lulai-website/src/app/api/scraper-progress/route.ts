import { NextResponse } from "next/server";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { scrapeWebsite } from "@/scripts/scrapeWebsite";

const ALLOWED_ORIGIN = "http://localhost:3000";
const DATABASE_URL = process.env.DATABASE_URL!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// Initialize DB Connection
const pool = new Pool({ connectionString: DATABASE_URL });

// OpenAI Client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Handle GET requests to this endpoint for progress updates via SSE
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Find the session file based on the session ID
    const sessionDir = path.join(process.cwd(), "scraper-sessions");
    try {
        const sessionFilePath = path.join(sessionDir, `${sessionId}.json`);

        // Create a ReadableStream for SSE (Server-Sent Events)
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Function to send progress updates through SSE
                    const sendProgress = (progress: number, message?: string) => {
                        const data = message
                            ? JSON.stringify({ progress, message })
                            : JSON.stringify({ progress });
                        controller.enqueue(`data: ${data}\n\n`);
                    };

                    // Send initial progress
                    sendProgress(5, "Starting web scraping...");

                    // Read the session file to get the URL
                    const sessionDataRaw = await fs.readFile(sessionFilePath, 'utf8');
                    const sessionData = JSON.parse(sessionDataRaw);
                    const url = sessionData.url;

                    if (!url) {
                        controller.enqueue(`data: ${JSON.stringify({
                            error: "No URL found in session"
                        })}\n\n`);
                        controller.close();
                        return;
                    }

                    // Process the scraping with progress tracking
                    try {
                        // Web scraping process
                        sendProgress(10, "Fetching website data...");

                        // Scrape the website
                        const scrapedData = await scrapeWebsite(url, (progress, msg) => {
                            sendProgress(10 + Math.floor(progress * 0.6), msg); // 10-70% progress for scraping
                        });

                        sendProgress(70, "Processing scraped data...");

                        // Store data in database and create embeddings
                        await processAndStoreScrapedData(scrapedData, sessionId, (progress, msg) => {
                            sendProgress(70 + Math.floor(progress * 0.25), msg); // 70-95% progress for processing
                        });

                        // Ensure we send the final completion message
                        sendProgress(100, "Web scraping complete!");
                        controller.close();
                    } catch (error) {
                        console.error("Error in web scraping process:", error);
                        controller.enqueue(`data: ${JSON.stringify({
                            error: error instanceof Error ? error.message : "Web scraping failed."
                        })}\n\n`);
                        controller.close();
                    }
                } catch (error) {
                    console.error("Error setting up scraping process:", error);
                    controller.enqueue(`data: ${JSON.stringify({
                        error: error instanceof Error ? error.message : "Setup failed."
                    })}\n\n`);
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
            },
        });
    } catch (error) {
        console.error("Error processing web scraping:", error);
        return NextResponse.json({ error: "Failed to process web scraping" }, { status: 500 });
    }
}

// Helper function to process and store scraped data
async function processAndStoreScrapedData(
    data: any,
    sessionId: string,
    progressCallback: (progress: number, message?: string) => void
) {
    // Create a table specifically for this session's data
    const client = await pool.connect();
    try {
        // Create a table for scraped content
        await client.query(`
      CREATE TABLE IF NOT EXISTS scraped_content (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        metadata JSONB,
        embedding vector(1536)
      );
    `);

        progressCallback(10, "Database setup complete");

        // Process each content item
        const totalItems = data.content.length;
        for (let i = 0; i < totalItems; i++) {
            const item = data.content[i];
            const contentId = `${sessionId}_${i}`;

            // Generate embeddings for the content
            const combinedText = `${item.title} ${item.content}`.trim();
            const embeddings = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: combinedText,
                encoding_format: "float",
            });

            // Format embedding for pgvector
            const formattedEmbedding = `[${embeddings.data[0].embedding.join(',')}]`;

            // Insert content into database
            await client.query(`
        INSERT INTO scraped_content (
          id, session_id, url, title, content, content_type, metadata, embedding
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                contentId,
                sessionId,
                item.url,
                item.title,
                item.content,
                item.type,
                item.metadata ? JSON.stringify(item.metadata) : null,
                formattedEmbedding
            ]);

            // Update progress
            const progressPercent = Math.floor((i + 1) / totalItems * 100);
            progressCallback(progressPercent, `Processed ${i + 1}/${totalItems} content items`);
        }

        progressCallback(100, "All data processed and stored");
    } finally {
        client.release();
    }
}