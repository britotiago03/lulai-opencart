import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const url = formData.get("url") as string;

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        // Generate a unique session ID that includes 'scrape' to identify it as a web scrape session
        const sessionId = `scrape_${uuidv4()}`;

        // Create session directory if it doesn't exist
        const sessionDir = path.join(process.cwd(), "scraper-sessions");
        await fs.mkdir(sessionDir, { recursive: true });

        // Save URL to a file for processing
        const sessionFilePath = path.join(sessionDir, `${sessionId}.json`);
        await fs.writeFile(
            sessionFilePath,
            JSON.stringify({
                url,
                timestamp: new Date().toISOString(),
                type: "web-scrape"
            })
        );

        // Return the session ID immediately so the frontend can start listening for progress events
        return NextResponse.json({
            success: true,
            session_id: sessionId,
            message: "Web scraping has begun."
        });
    } catch (error: any) {
        console.error("Error in web scraper handler:", error);
        return NextResponse.json(
            { error: error.message || "Failed to start web scraping" },
            { status: 500 }
        );
    }
}