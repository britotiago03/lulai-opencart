// lulai-opencart/lulai-chatbot/nextjs-chatbot/app/api/storage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loadProductDataForStore, updateSystemPrompt } from "@/app/scripts/loadDb";

// CORS headers setup for OPTIONS, POST, and now PUT
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PUT, OPTIONS, GET",
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

    console.log('Received integration request:', { storeName, productApiUrl, platform });

    if (!storeName || !productApiUrl || !platform) {
      return NextResponse.json({ message: "Missing required fields." }, { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    const finalApiKey = apiKey || undefined;

    await loadProductDataForStore({ 
      storeName, 
      productApiUrl, 
      platform, 
      apiKey: finalApiKey, 
      customPrompt 
    });

    return NextResponse.json(
      { message: "Integration started." },
      {
        status: 202,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    console.error('Integration error:', error);

    return NextResponse.json(
      { 
        message: `Error: ${error.message}`, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }
}

// PUT endpoint to update only the custom prompt in AstraDB
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, customPrompt } = body;

    if (!apiKey || !customPrompt) {
      return NextResponse.json({ message: "Missing required fields." }, { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    await updateSystemPrompt(apiKey, customPrompt);
    return NextResponse.json(
      { message: "Prompt updated successfully" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    console.error('Prompt update error:', error);

    return NextResponse.json(
      { 
        message: `Error: ${error.message}`, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PUT, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}