import { NextRequest, NextResponse } from "next/server";
import { loadProductDataForStore, updateSystemPrompt } from "@/app/scripts/loadDb";
import { Pool } from 'pg';

// CORS headers setup for OPTIONS, POST, and now PUT
export async function OPTIONS() {
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

    if (!storeName || !productApiUrl || !platform || !apiKey) {
      return NextResponse.json({ message: "Missing required fields. All of storeName, productApiUrl, platform, and apiKey are required." }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    // Start the integration process asynchronously
    // This allows us to return a response immediately while the process runs in the background
    void (async () => {
      try {
        await loadProductDataForStore({
          storeName,
          productApiUrl,
          platform,
          apiKey,
          customPrompt
        });
        console.log('Integration completed successfully for:', apiKey);
      } catch (asyncError) {
        console.error('Async integration error:', asyncError);
      }
    })();

    return NextResponse.json(
        { message: "Integration started. You can check the status via GET request." },
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
  } catch (error: unknown) {
    console.error('Integration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;

    return NextResponse.json(
        {
          message: `Error: ${errorMessage}`,
          stack: errorStack
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

// PUT endpoint to update only the custom prompt
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, customPrompt } = body;

    if (!apiKey || !customPrompt) {
      return NextResponse.json({ message: "Missing required fields. Both apiKey and customPrompt are required." }, {
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
  } catch (error: unknown) {
    console.error('Prompt update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;

    return NextResponse.json(
        {
          message: `Error: ${errorMessage}`,
          stack: errorStack
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
  // Get apiKey from query parameters
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json(
        { message: "Missing required apiKey parameter" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          }
        }
    );
  }

  // Create a ReadableStream that will send progress updates
  const progressStream = new ReadableStream({
    start(controller) {
      try {
        const sendUpdate = (status: string) => {
          controller.enqueue(`data: { "status": "${status}" }\n\n`);
        };

        // Check if tables exist for this API key
        void (async () => {
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
          });

          const sanitizedKey = apiKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const productTableName = `${sanitizedKey}_productlist`;

          try {
            // Check if the tables exist and have data
            const client = await pool.connect();
            try {
              sendUpdate("Checking integration status...");

              // Check if the product table exists and has data
              const productTableExists = await client.query(
                  `SELECT EXISTS (
                  SELECT FROM information_schema.tables 
                  WHERE table_schema = current_schema() 
                  AND table_name = $1
                )`,
                  [productTableName]
              );

              if (!productTableExists.rows[0].exists) {
                sendUpdate("No product data found. Integration may not have been started.");
                controller.close();
                return;
              }

              // Check if the table has data
              const productCount = await client.query(
                  `SELECT COUNT(*) FROM ${productTableName}`
              );

              if (parseInt(productCount.rows[0].count) === 0) {
                sendUpdate("Product table exists but contains no data. Integration may be in progress or failed.");
                controller.close();
                return;
              }

              // Check chatbot in main table
              const chatbotCheck = await client.query(
                  `SELECT name, platform, updated_at FROM chatbots WHERE api_key = $1`,
                  [apiKey]
              );

              if (chatbotCheck.rows.length === 0) {
                sendUpdate(`Product data found but no chatbot configuration in the database. Integration partially complete.`);
              } else {
                const chatbot = chatbotCheck.rows[0];
                const updatedAt = new Date(chatbot.updated_at).toLocaleString();
                sendUpdate(`Integration complete for ${chatbot.name} (${chatbot.platform}). Last updated: ${updatedAt}`);
              }

              // Successful completion
              controller.close();
            } finally {
              client.release();
            }
          } catch (error: unknown) {
            console.error("Error checking integration status:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            sendUpdate(`Error checking integration status: ${errorMessage}`);
            controller.close();
          }
        })();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        controller.enqueue(`data: { "status": "Error: ${errorMessage}" }\n\n`);
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