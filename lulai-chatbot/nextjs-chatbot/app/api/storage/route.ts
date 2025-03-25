// storage.ts
import { NextRequest, NextResponse } from "next/server";
import { loadProductDataForStore, updateSystemPrompt } from "@/scripts/loadDb";

const ALLOWED_ORIGIN = "http://localhost:3000";

// CORS headers setup for OPTIONS, POST, and now PUT
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

// POST request to start the integration process
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeName, productApiUrl, platform, apiKey, customPrompt } = body;

    if (!storeName || !productApiUrl || !platform) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const finalApiKey = apiKey || undefined;

    await loadProductDataForStore({ storeName, productApiUrl, platform, apiKey: finalApiKey, customPrompt });

    return NextResponse.json(
      { message: "Integration started." },
      {
        status: 202,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

// PUT endpoint to update only the custom prompt in AstraDB
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, customPrompt } = body;
    if (!apiKey || !customPrompt) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    await updateSystemPrompt(apiKey, customPrompt);
    return NextResponse.json(
      { message: "Prompt updated successfully" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

// Server-sent events for streaming progress updates
export async function GET(req: NextRequest) {
  const progressStream = new ReadableStream({
    start(controller) {
      try {
        const sendUpdate = (status: string) => {
          controller.enqueue(`data: { "status": "${status}" }\n\n`);
        };

        sendUpdate("Fetching product data...");

        setTimeout(() => {
          sendUpdate("Processing and storing data...");
          setTimeout(() => {
            sendUpdate("Integration complete!");
            controller.close();
          }, 4000);
        }, 3000);
      } catch (error: any) {
        controller.enqueue(`data: { "status": "Error: ${error.message}" }\n\n`);
        controller.close();
      }
    },
  });

  return new NextResponse(progressStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
