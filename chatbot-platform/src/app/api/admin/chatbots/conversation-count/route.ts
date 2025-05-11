import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

// This endpoint returns conversation counts for each chatbot
export const GET = withAdminAuth(async () => {
    const client = await pool.connect();
    try {
        // Get conversation counts for each chatbot by api_key
        const result = await client.query(`
            SELECT 
                c.id as chatbot_id, 
                c.api_key,
                COUNT(DISTINCT conv.user_id || conv.api_key) as conversation_count,
                MAX(conv.created_at) as last_active
            FROM 
                chatbots c
            LEFT JOIN 
                conversations conv ON c.api_key = conv.api_key
            GROUP BY 
                c.id, c.api_key
        `);

        const conversationCounts = result.rows.map(row => ({
            chatbotId: row.chatbot_id,
            apiKey: row.api_key,
            conversationCount: parseInt(row.conversation_count) || 0,
            lastActive: row.last_active || null
        }));

        return NextResponse.json(conversationCounts);
    } catch (error) {
        console.error("Error fetching chatbot conversation counts:", error);
        return NextResponse.json(
            { message: "Failed to fetch conversation counts" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});