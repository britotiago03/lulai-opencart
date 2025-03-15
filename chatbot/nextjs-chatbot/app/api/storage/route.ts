import { NextRequest, NextResponse } from "next/server";
import { loadProductDataForStore } from "@/scripts/loadDb";

// POST request to start the integration process
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeName, productApiUrl, platform, apiKey } = body;

    if (!storeName || !productApiUrl || !platform) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Check for the platform type and call the appropriate function
    if (platform === "customstore") {
      // Handle custom store logic here
      await loadProductDataForStore({ storeName, productApiUrl, platform, apiKey });
    } else {
      // Existing platforms handling
      await loadProductDataForStore({ storeName, productApiUrl, platform, apiKey });
    }

    return NextResponse.json({ message: "Integration started." }, { status: 202 });

  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

// Server-sent events (for streaming progress updates)
export async function GET(req: NextRequest) {
  const progressStream = new ReadableStream({
    start(controller) {
      try {
        // Function to send progress update
        const sendUpdate = (status: string) => {
          controller.enqueue(`data: { "status": "${status}" }\n\n`);
        };

        // Simulate progress steps
        sendUpdate("Fetching product data...");

        setTimeout(() => {
          sendUpdate("Processing and storing data...");
          
          setTimeout(() => {
            sendUpdate("Integration complete!");
            controller.close();  // Close the stream after completion
          }, 4000); // Simulate some processing delay
        }, 3000); // Simulate fetch delay

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
    },
  });
}
