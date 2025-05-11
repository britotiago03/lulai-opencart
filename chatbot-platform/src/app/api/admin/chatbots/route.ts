// src/app/api/admin/chatbots/route.ts
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export const GET = withAdminAuth(async () => {
    const client = await pool.connect();
    try {
        // Join tables to get all relevant information
        const result = await client.query(`
      SELECT c.id, c.name, c.user_id, c.api_key, u.name as user_name, u.email as user_email,
             c.industry, c.platform, c.created_at, 
             a.conversation_count, a.message_count,
             CASE 
               WHEN a.message_count > 0 THEN 'active'
               WHEN c.updated_at < NOW() - INTERVAL '30 days' THEN 'inactive'
               ELSE 'active'
             END as status,
             COALESCE(
               (SELECT MAX(created_at) FROM conversations WHERE api_key = c.api_key),
               c.updated_at
             ) as last_active
      FROM chatbots c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN analytics a ON c.id = a.chatbot_id
      ORDER BY last_active DESC
    `);

        // Format the data to match the expected structure
        const formattedChatbots = result.rows.map(chatbot => ({
            id: chatbot.id,
            name: chatbot.name,
            userId: chatbot.user_id,
            userName: chatbot.user_name,
            userEmail: chatbot.user_email,
            industry: chatbot.industry || 'Unknown',
            platform: chatbot.platform || 'Custom',
            created_at: chatbot.created_at,
            status: chatbot.status,
            conversationCount: chatbot.conversation_count || 0,
            lastActive: chatbot.last_active || chatbot.created_at,
            api_key: chatbot.api_key // Add the API key
        }));

        return NextResponse.json(formattedChatbots);
    } catch (error) {
        console.error("Error fetching chatbots:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});