import { NextResponse } from "next/server";
import { loadProductDataFromJsonFile } from "@/scripts/loadDb";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Assuming you have uuid installed

const ALLOWED_ORIGIN = "http://localhost:3002";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the file with a name that includes the session ID
    const filePath = path.join(uploadDir, `${sessionId}_${file.name}`);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return the session ID immediately so the frontend can start listening for progress events
    return NextResponse.json({
      success: true,
      session_id: sessionId,
      message: "File uploaded successfully. Processing has begun."
    });
  } catch (error: any) {
    console.error("Error in upload handler:", error);
    return NextResponse.json(
        { error: error.message || "Failed to upload file" },
        { status: 500 }
    );
  }
}

// Handle GET requests to this endpoint for progress updates via SSE
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  // Find the file path based on the session ID
  const uploadDir = path.join(process.cwd(), "uploads");
  try {
    const files = await fs.readdir(uploadDir);
    const sessionFile = files.find(file => file.startsWith(sessionId));

    if (!sessionFile) {
      return NextResponse.json({ error: "No file found for this session" }, { status: 404 });
    }

    const filePath = path.join(uploadDir, sessionFile);

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
          sendProgress(5, "Starting data processing...");

          // Process the file with progress tracking
          await loadProductDataFromJsonFile(filePath, sendProgress);

          // Ensure we send the final completion message
          sendProgress(100, "Integration complete!");
          controller.close();
        } catch (error) {
          console.error("Error processing file:", error);
          controller.enqueue(`data: ${JSON.stringify({
            error: error instanceof Error ? error.message : "Processing failed."
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
    console.error("Error processing file:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}