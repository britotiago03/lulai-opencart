import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return new NextResponse("Missing session_id", { status: 400 });
  }

  const progressStream = new ReadableStream({
    start(controller) {
      const sendUpdate = (status: string) => {
        controller.enqueue(`data: ${JSON.stringify({ status })}\n\n`);
      };

      sendUpdate("Fetching product data...");

      setTimeout(() => {
        sendUpdate("Processing and storing data...");
        setTimeout(() => {
          sendUpdate("Integration complete!");
          controller.close();
        }, 4000);
      }, 3000);
    },
  });

  return new NextResponse(progressStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
