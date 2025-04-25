// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from "@/lib/db";

// GET: Retrieve conversations for a specific chatbot or user
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
        const chatbotId = searchParams.get('chatbotId');
        const conversationId = searchParams.get('conversationId');
        const userId = searchParams.get('userId');
        const apiKey = searchParams.get('apiKey');

        const client = await pool.connect();

        try {
            // Case for fetching by userId and apiKey
            if (userId && apiKey) {
                // For clients, verify that the apiKey belongs to one of their chatbots
                if (session.user.role !== 'admin') {
                    const ownerCheck = await client.query(
                        "SELECT id FROM chatbots WHERE api_key = $1 AND user_id = $2",
                        [apiKey, session.user.id]
                    );

                    if (ownerCheck.rows.length === 0) {
                        return NextResponse.json(
                            { message: "Unauthorized to access this conversation" },
                            { status: 403 }
                        );
                    }
                }

                const result = await client.query(
                    `SELECT * FROM conversations
                     WHERE user_id = $1 AND api_key = $2
                     ORDER BY created_at ASC`,
                    [userId, apiKey]
                );

                return NextResponse.json(result.rows);
            }

            // Special case for retrieving a specific conversation
            else if (conversationId) {
                // If admin, can access all conversations
                // If client, verify ownership first
                let query = `
                    SELECT c.*, cb.user_id
                    FROM conversations c
                             JOIN chatbots cb ON c.api_key = cb.api_key
                    WHERE c.id = $1
                `;

                // For clients, add user ownership check
                if (session.user.role !== 'admin') {
                    query += ` AND cb.user_id = $2`;
                }

                const result = await client.query(
                    query,
                    session.user.role === 'admin'
                        ? [conversationId]
                        : [conversationId, session.user.id]
                );

                if (result.rows.length === 0) {
                    return NextResponse.json(
                        { message: "Conversation not found or unauthorized" },
                        { status: 404 }
                    );
                }

                return NextResponse.json(result.rows[0]);
            }

            // For specific chatbot conversations
            else if (chatbotId) {
                // Verify ownership first for clients
                if (session.user.role !== 'admin') {
                    const ownerCheck = await client.query(
                        "SELECT id FROM chatbots WHERE id = $1 AND user_id = $2",
                        [chatbotId, session.user.id]
                    );

                    if (ownerCheck.rows.length === 0) {
                        return NextResponse.json(
                            { message: "Chatbot not found or unauthorized" },
                            { status: 404 }
                        );
                    }
                }

                // Get the API key for this chatbot
                const apiKeyResult = await client.query(
                    "SELECT api_key FROM chatbots WHERE id = $1",
                    [chatbotId]
                );

                if (apiKeyResult.rows.length === 0) {
                    return NextResponse.json(
                        { message: "Chatbot not found" },
                        { status: 404 }
                    );
                }

                const apiKey = apiKeyResult.rows[0].api_key;

                // Get all conversations for this API key
                const result = await client.query(
                    `SELECT c.*
                     FROM conversations c
                     WHERE c.api_key = $1
                     ORDER BY c.created_at DESC
                         LIMIT 100`,
                    [apiKey]
                );

                return NextResponse.json(result.rows);
            }

            // For all conversations (admin or client's own)
            else {
                if (session.user.role === 'admin') {
                    // Admin can see all conversations
                    const result = await client.query(`
                        SELECT c.*, cb.name as chatbot_name
                        FROM conversations c
                                 LEFT JOIN chatbots cb ON c.api_key = cb.api_key
                        ORDER BY c.created_at DESC
                            LIMIT 100
                    `);

                    return NextResponse.json(result.rows);
                } else {
                    // Client can only see conversations for their chatbots

                    // First, get all API keys for this user's chatbots
                    const apiKeysResult = await client.query(
                        "SELECT api_key FROM chatbots WHERE user_id = $1",
                        [session.user.id]
                    );

                    if (apiKeysResult.rows.length === 0) {
                        // User has no chatbots yet
                        return NextResponse.json([]);
                    }

                    // Extract the API keys
                    const apiKeys = apiKeysResult.rows.map(row => row.api_key);

                    // Get conversations for these API keys
                    const result = await client.query(
                        `SELECT c.*, cb.name as chatbot_name
                         FROM conversations c
                                  JOIN chatbots cb ON c.api_key = cb.api_key
                         WHERE c.api_key = ANY($1)
                         ORDER BY c.created_at DESC
                             LIMIT 100`,
                        [apiKeys]
                    );

                    return NextResponse.json(result.rows);
                }
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}