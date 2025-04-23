// src/app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export const GET = withAdminAuth(async () => {
    const client = await pool.connect();
    try {
        // Get total conversations
        const totalConversationsResult = await client.query(`
            SELECT COUNT(DISTINCT user_id || api_key) as total_conversations
            FROM conversations
        `);
        const totalConversations = parseInt(totalConversationsResult.rows[0].total_conversations) || 0;

        // Calculate average conversations per chatbot
        const avgConversationsResult = await client.query(`
            SELECT AVG(conversation_count) as avg_conversations
            FROM analytics
            WHERE conversation_count > 0
        `);
        const averageConversationsPerChatbot = parseFloat(avgConversationsResult.rows[0]?.avg_conversations) || 0;

        // Get user growth (new users last 30 days)
        const userGrowthResult = await client.query(`
            SELECT COUNT(*) as new_users
            FROM users
            WHERE created_at > NOW() - INTERVAL '30 days'
        `);
        const userGrowth = parseInt(userGrowthResult.rows[0].new_users) || 0;

        // Get message analytics (total messages, average per conversation)
        const messageAnalyticsResult = await client.query(`
            SELECT 
                COUNT(*) as total_messages,
                COUNT(*) / NULLIF(COUNT(DISTINCT user_id || api_key), 0) as avg_messages_per_conversation
            FROM conversations
        `);
        const totalMessages = parseInt(messageAnalyticsResult.rows[0].total_messages) || 0;
        const avgMessagesPerConversation = parseFloat(messageAnalyticsResult.rows[0].avg_messages_per_conversation) || 0;

        // Get conversations by product category (simulating cart actions)
        const cartActionsResult = await client.query(`
            SELECT COUNT(*) as total_cart_actions
            FROM conversations
            WHERE message_content ILIKE '%add to cart%' OR message_content ILIKE '%buy%'
        `);
        const totalCartActions = parseInt(cartActionsResult.rows[0].total_cart_actions) || 0;

        // Get chatbot performance metrics
        const chatbotPerformanceResult = await client.query(`
            SELECT 
                c.id as chatbot_id,
                c.name as chatbot_name,
                COUNT(DISTINCT conv.user_id) as unique_users,
                COUNT(*) as message_count,
                MAX(conv.created_at) as last_active
            FROM chatbots c
            LEFT JOIN conversations conv ON c.api_key = conv.api_key
            GROUP BY c.id, c.name
            ORDER BY message_count DESC
            LIMIT 5
        `);

        return NextResponse.json({
            totalConversations,
            averageConversationsPerChatbot,
            userGrowth,
            totalMessages,
            avgMessagesPerConversation,
            totalCartActions,
            topPerformingChatbots: chatbotPerformanceResult.rows.map(row => ({
                id: row.chatbot_id,
                name: row.chatbot_name,
                uniqueUsers: parseInt(row.unique_users) || 0,
                messageCount: parseInt(row.message_count) || 0,
                lastActive: row.last_active
            }))
        });
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});