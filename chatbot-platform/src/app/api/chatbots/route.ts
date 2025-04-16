// src/app/api/chatbots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { pool } from "@/lib/db";
import { userAuthOptions } from "@/lib/auth-config";

// GET: Retrieve all chatbots or chatbots for a specific user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const apiKey = searchParams.get('apiKey');

        const client = await pool.connect();
        try {
            // Case for fetching by API key
            if (apiKey) {
                let query = "SELECT * FROM chatbots WHERE api_key = $1";
                let params = [apiKey];

                // If not admin, need to verify ownership
                if (session.user.role !== "admin") {
                    query += " AND user_id = $2";
                    params.push(session.user.id);
                }

                const result = await client.query(query, params);

                if (result.rows.length === 0) {
                    return NextResponse.json(
                        { message: "Chatbot not found or unauthorized" },
                        { status: 404 }
                    );
                }

                return NextResponse.json(result.rows[0]);
            }

            // Default case: fetch all chatbots based on user role
            let result;

            // If admin, fetch all chatbots, else fetch only user's chatbots
            if (session.user.role === "admin") {
                result = await client.query(`
                    SELECT c.*, u.name as user_name, u.email as user_email 
                    FROM chatbots c 
                    JOIN users u ON c.user_id = u.id 
                    ORDER BY c.created_at DESC
                `);
            } else {
                result = await client.query(
                    "SELECT * FROM chatbots WHERE user_id = $1 ORDER BY created_at DESC",
                    [session.user.id]
                );
            }

            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching chatbots:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST: Create a new chatbot
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            storeName,
            productApiUrl,
            platform,
            apiKey,
            industry,
            customPrompt
        } = await req.json();

        // Basic validation
        if (!storeName || !productApiUrl || !platform || !apiKey) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            // Start transaction
            await client.query('BEGIN');

            // Insert chatbot record
            const chatbotResult = await client.query(
                `INSERT INTO chatbots (
                    name, description, api_key, industry, platform, product_api_url, 
                    custom_prompt, user_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    storeName,
                    `Chatbot for ${storeName}`,
                    apiKey,
                    industry,
                    platform,
                    productApiUrl,
                    customPrompt,
                    session.user.id
                ]
            );

            const newChatbot = chatbotResult.rows[0];

            // Create widget config for the chatbot
            await client.query(
                `INSERT INTO widget_configs (chatbot_id) VALUES ($1)`,
                [newChatbot.id]
            );

            // Create analytics record for the chatbot
            await client.query(
                `INSERT INTO analytics (chatbot_id) VALUES ($1)`,
                [newChatbot.id]
            );

            /*
            // Now communicate with the lulai-chatbot service to store the chatbot data
            const lulaiChatbotResponse = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_URL}/api/storage`, {
            */
            const lulaiChatbotResponse = await fetch(`${process.env.CHATBOT_SERVICE_URL}/api/storage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeName,
                    productApiUrl,
                    platform,
                    apiKey,
                    customPrompt
                }),
            });

            if (!lulaiChatbotResponse.ok) {
                // Rollback if the external service call fails
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { message: "Failed to create chatbot integration" },
                    { status: 500 }
                );
            }

            // Commit transaction
            await client.query('COMMIT');

            return NextResponse.json({
                message: "Chatbot created successfully",
                chatbot: newChatbot
            }, { status: 201 });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error creating chatbot:", error);
            return NextResponse.json(
                { message: "Failed to create chatbot" },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Chatbot creation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}