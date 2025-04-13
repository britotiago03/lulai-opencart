// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { pool } from "@/lib/db";

// Define interface for chatbot analytics
interface ChatbotAnalytics {
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversions: number;
    conversionRate: number;
    dailyStats: any[];
    topQueries: any[];
    intentDistribution: any[];
    cartOperations: any[];
    navigationActions: any[];
}

// Define interface for chatbot stats
interface ChatbotStat extends ChatbotAnalytics {
    chatbotId: string;
    apiKey: string;
    name?: string;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const chatbotId = searchParams.get('chatbotId');
        const timeRange = searchParams.get('timeRange') || '30'; // Default to 30 days
        const daysToInclude = parseInt(timeRange);

        const client = await pool.connect();

        try {
            // Case 1: Analytics for a specific chatbot
            if (chatbotId) {
                // Verify ownership if not admin
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
                    "SELECT api_key, name FROM chatbots WHERE id = $1",
                    [chatbotId]
                );

                if (apiKeyResult.rows.length === 0) {
                    return NextResponse.json(
                        { message: "Chatbot not found" },
                        { status: 404 }
                    );
                }

                const apiKey = apiKeyResult.rows[0].api_key;
                const chatbotName = apiKeyResult.rows[0].name;

                // Calculate analytics for this chatbot
                const chatbotAnalytics = await calculateChatbotAnalytics(client, apiKey, daysToInclude);

                // Update analytics record
                await client.query(
                    `UPDATE analytics
                     SET conversation_count = $1,
                         message_count = $2,
                         avg_response_time = $3,
                         conversion_rate = $4,
                         updated_at = NOW()
                     WHERE chatbot_id = $5`,
                    [
                        chatbotAnalytics.totalConversations,
                        chatbotAnalytics.totalMessages,
                        chatbotAnalytics.averageResponseTime,
                        chatbotAnalytics.conversionRate,
                        chatbotId
                    ]
                );

                return NextResponse.json({
                    ...chatbotAnalytics,
                    chatbotName
                });
            }

            // Case 2: Admin requesting global analytics
            else if (session.user.role === 'admin') {
                // Get global stats
                const totalUsers = await client.query("SELECT COUNT(*) FROM users");
                const totalChatbots = await client.query("SELECT COUNT(*) FROM chatbots");

                // Get all conversations within the time range
                const conversationsQuery = await client.query(`
                    SELECT COUNT(DISTINCT user_id || api_key) as count
                    FROM conversations
                    WHERE created_at > NOW() - INTERVAL '${daysToInclude} days'
                `);

                const totalConversations = parseInt(conversationsQuery.rows[0].count) || 0;

                // Count cart operations
                const cartActionsQuery = await client.query(`
                    SELECT COUNT(*) as count
                    FROM conversations
                    WHERE metadata::jsonb->'action'->>'type' = 'cart'
                    AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                `);

                const totalCartActions = parseInt(cartActionsQuery.rows[0].count) || 0;

                // Calculate averages
                const averageQuery = await client.query(`
                    SELECT 
                        AVG(a.conversation_count) as avg_conversations,
                        AVG(a.message_count) as avg_messages,
                        AVG(a.conversion_rate) as avg_conversion
                    FROM analytics a
                `);

                // Get recent activity - daily conversation counts
                const recentActivity = await client.query(`
                    SELECT DATE(created_at) as date, COUNT(DISTINCT user_id || api_key) as count
                    FROM conversations
                    WHERE created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                `);

                // Get intent distribution
                const intentDistribution = await client.query(`
                    SELECT 
                        metadata::jsonb->'intentAnalysis'->>'primaryIntent' as intent,
                        COUNT(*) as count
                    FROM conversations
                    WHERE 
                        metadata::jsonb->'intentAnalysis'->>'primaryIntent' IS NOT NULL
                        AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY metadata::jsonb->'intentAnalysis'->>'primaryIntent'
                    ORDER BY count DESC
                `);

                // Get top queries (most frequent terms in user messages)
                const topQueriesResult = await client.query(`
                    SELECT message_content, COUNT(*) as count
                    FROM conversations
                    WHERE message_role = 'user'
                    AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY message_content
                    ORDER BY count DESC
                    LIMIT 5
                `);

                // Get top chatbots by conversation count
                const topChatbots = await client.query(`
                    SELECT 
                        c.api_key,
                        cb.name,
                        COUNT(DISTINCT c.user_id) as user_count,
                        COUNT(*) as message_count
                    FROM conversations c
                    JOIN chatbots cb ON c.api_key = cb.api_key
                    WHERE c.created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY c.api_key, cb.name
                    ORDER BY user_count DESC
                    LIMIT 5
                `);

                // Get top performing chatbots (by conversion rate)
                const topPerformingChatbots = await client.query(`
                    WITH ChatbotStats AS (
                        SELECT 
                            c.api_key,
                            cb.name,
                            COUNT(DISTINCT c.user_id) as total_users,
                            COUNT(*) FILTER (WHERE c.metadata::jsonb->'action'->>'type' = 'cart' AND c.metadata::jsonb->'action'->>'operation' = 'add') as conversions
                        FROM conversations c
                        JOIN chatbots cb ON c.api_key = cb.api_key
                        WHERE c.created_at > NOW() - INTERVAL '${daysToInclude} days'
                        GROUP BY c.api_key, cb.name
                    )
                    SELECT 
                        api_key,
                        name,
                        total_users,
                        conversions,
                        CASE WHEN total_users > 0 THEN 
                            ROUND((conversions::numeric / total_users) * 100, 2)
                        ELSE 0 END as conversion_rate
                    FROM ChatbotStats
                    WHERE total_users > 0
                    ORDER BY conversion_rate DESC
                    LIMIT 5
                `);

                return NextResponse.json({
                    totalUsers: parseInt(totalUsers.rows[0].count),
                    totalChatbots: parseInt(totalChatbots.rows[0].count),
                    totalConversations,
                    totalCartActions,
                    conversionRate: totalConversations > 0 ? (totalCartActions / totalConversations) * 100 : 0,
                    averageConversationsPerChatbot: parseFloat(averageQuery.rows[0].avg_conversations) || 0,
                    averageMessagesPerChatbot: parseFloat(averageQuery.rows[0].avg_messages) || 0,
                    averageConversionRate: parseFloat(averageQuery.rows[0].avg_conversion) || 0,
                    recentActivity: recentActivity.rows,
                    intentDistribution: intentDistribution.rows,
                    topQueries: topQueriesResult.rows,
                    topChatbots: topChatbots.rows,
                    topPerformingChatbots: topPerformingChatbots.rows,
                    timeRange: daysToInclude
                });
            }

            // Case 3: Client requesting their own aggregate analytics
            else {
                // Get all chatbots for this user
                const chatbotsResult = await client.query(
                    "SELECT id, api_key, name FROM chatbots WHERE user_id = $1",
                    [session.user.id]
                );

                if (chatbotsResult.rows.length === 0) {
                    // User has no chatbots yet
                    return NextResponse.json({
                        totalChatbots: 0,
                        totalConversations: 0,
                        totalMessages: 0,
                        averageResponseTime: 0,
                        conversionRate: 0,
                        chatbotStats: []
                    });
                }

                // Extract chatbot IDs and API keys
                const chatbotIds = chatbotsResult.rows.map(row => row.id);
                const apiKeys = chatbotsResult.rows.map(row => row.api_key);

                // Calculate aggregate statistics
                let totalConversations = 0;
                let totalMessages = 0;
                let totalResponseTime = 0;
                let responseTimeCount = 0;
                let totalConversions = 0;

                // Get stats for each chatbot
                const chatbotStats: ChatbotStat[] = [];

                for (const row of chatbotsResult.rows) {
                    const chatbotAnalytics = await calculateChatbotAnalytics(client, row.api_key, daysToInclude);

                    totalConversations += chatbotAnalytics.totalConversations;
                    totalMessages += chatbotAnalytics.totalMessages;

                    if (chatbotAnalytics.averageResponseTime > 0) {
                        totalResponseTime += chatbotAnalytics.averageResponseTime;
                        responseTimeCount++;
                    }

                    totalConversions += chatbotAnalytics.conversions;

                    // Add chatbot stats with correct typing
                    chatbotStats.push({
                        chatbotId: row.id,
                        apiKey: row.api_key,
                        name: row.name,
                        ...chatbotAnalytics
                    });

                    // Update analytics record for this chatbot
                    await client.query(
                        `UPDATE analytics 
                        SET conversation_count = $1, 
                            message_count = $2, 
                            avg_response_time = $3, 
                            conversion_rate = $4, 
                            updated_at = NOW()
                        WHERE chatbot_id = $5`,
                        [
                            chatbotAnalytics.totalConversations,
                            chatbotAnalytics.totalMessages,
                            chatbotAnalytics.averageResponseTime,
                            chatbotAnalytics.conversionRate,
                            row.id
                        ]
                    );
                }

                // Get recent activity for all user's chatbots
                const recentActivity = await client.query(`
                    SELECT DATE(created_at) as date, COUNT(DISTINCT user_id || api_key) as count
                    FROM conversations
                    WHERE api_key = ANY($1)
                    AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY DATE(created_at)
                    ORDER BY date
                `, [apiKeys]);

                // Get intent distribution for all user's chatbots
                const intentDistribution = await client.query(`
                    SELECT 
                        metadata::jsonb->'intentAnalysis'->>'primaryIntent' as intent,
                        COUNT(*) as count
                    FROM conversations
                    WHERE 
                        api_key = ANY($1)
                        AND metadata::jsonb->'intentAnalysis'->>'primaryIntent' IS NOT NULL
                        AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY metadata::jsonb->'intentAnalysis'->>'primaryIntent'
                    ORDER BY count DESC
                `, [apiKeys]);

                // Get top queries for all user's chatbots
                const topQueries = await client.query(`
                    SELECT message_content, COUNT(*) as count
                    FROM conversations
                    WHERE api_key = ANY($1)
                    AND message_role = 'user'
                    AND created_at > NOW() - INTERVAL '${daysToInclude} days'
                    GROUP BY message_content
                    ORDER BY count DESC
                    LIMIT 5
                `, [apiKeys]);

                // Calculate totals and averages
                const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
                const conversionRate = totalConversations > 0 ? (totalConversions / totalConversations) * 100 : 0;

                return NextResponse.json({
                    totalChatbots: chatbotIds.length,
                    totalConversations,
                    totalMessages,
                    averageResponseTime,
                    conversionRate,
                    recentActivity: recentActivity.rows,
                    intentDistribution: intentDistribution.rows,
                    topQueries: topQueries.rows,
                    chatbotStats,
                    timeRange: daysToInclude
                });
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Helper function to calculate analytics for a specific chatbot
async function calculateChatbotAnalytics(client, apiKey, daysToInclude = 30): Promise<ChatbotAnalytics> {
    // Count distinct conversations (grouped by user_id)
    const conversationsResult = await client.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversations
         WHERE api_key = $1
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'`,
        [apiKey]
    );

    const totalConversations = parseInt(conversationsResult.rows[0].count) || 0;

    // Count total messages
    const messagesResult = await client.query(
        `SELECT COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'`,
        [apiKey]
    );

    const totalMessages = parseInt(messagesResult.rows[0].count) || 0;

    // Calculate average response time using metadata
    const responseTimeResult = await client.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (a.created_at - u.created_at))) as avg_time
         FROM conversations a
                  JOIN conversations u ON a.user_id = u.user_id AND a.api_key = u.api_key
         WHERE a.api_key = $1
           AND a.message_role = 'assistant'
           AND u.message_role = 'user'
           AND a.created_at > u.created_at
           AND a.created_at > NOW() - INTERVAL '${daysToInclude} days'
           AND NOT EXISTS (
             SELECT 1 FROM conversations b
             WHERE b.user_id = a.user_id
           AND b.created_at > u.created_at
           AND b.created_at < a.created_at
             )`,
        [apiKey]
    );

    const averageResponseTime = parseFloat(responseTimeResult.rows[0]?.avg_time) || 0;

    // Count "conversions" from metadata - cart actions
    const conversionsResult = await client.query(
        `SELECT COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND metadata::jsonb->'action'->>'type' = 'cart'
           AND metadata::jsonb->'action'->>'operation' = 'add'
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'`,
        [apiKey]
    );

    const conversions = parseInt(conversionsResult.rows[0].count) || 0;

    // Calculate conversion rate
    const conversionRate = totalConversations > 0 ? (conversions / totalConversations) * 100 : 0;

    // Get daily stats for the past week/month
    const dailyStatsResult = await client.query(
        `SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as conversation_count, COUNT(*) as message_count
         FROM conversations
         WHERE api_key = $1
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [apiKey]
    );

    // Get top queries (most frequent terms in user messages)
    const topQueriesResult = await client.query(
        `SELECT message_content, COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND message_role = 'user'
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'
         GROUP BY message_content
         ORDER BY count DESC
             LIMIT 5`,
        [apiKey]
    );

    // Get intent distribution from metadata
    const intentDistributionResult = await client.query(
        `SELECT
             metadata::jsonb->'intentAnalysis'->>'primaryIntent' as intent,
            COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND metadata::jsonb->'intentAnalysis'->>'primaryIntent' IS NOT NULL
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'
         GROUP BY metadata::jsonb->'intentAnalysis'->>'primaryIntent'
         ORDER BY count DESC
             LIMIT 10`,
        [apiKey]
    );

    // Get cart operations from metadata
    const cartOperationsResult = await client.query(
        `SELECT
             metadata::jsonb->'action'->>'operation' as operation,
            COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND metadata::jsonb->'action'->>'type' = 'cart'
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'
         GROUP BY metadata::jsonb->'action'->>'operation'
         ORDER BY count DESC`,
        [apiKey]
    );

    // Get navigation actions from metadata
    const navigationActionsResult = await client.query(
        `SELECT
             COALESCE(metadata::jsonb->'action'->>'pageName', 
                     metadata::jsonb->'navigationAction'->>'pageName', 
                     metadata::jsonb->'action'->>'productName', 
                     metadata::jsonb->'navigationAction'->>'productName',
                     'Unknown') as target,
             COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND ((metadata::jsonb->'action'->>'type' = 'navigate') OR
             (metadata::jsonb->'navigationAction'->>'type' = 'navigate'))
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'
         GROUP BY target
         ORDER BY count DESC
             LIMIT 10`,
        [apiKey]
    );

    return {
        totalConversations,
        totalMessages,
        averageResponseTime,
        conversions,
        conversionRate,
        dailyStats: dailyStatsResult.rows,
        topQueries: topQueriesResult.rows,
        intentDistribution: intentDistributionResult.rows || [],
        cartOperations: cartOperationsResult.rows || [],
        navigationActions: navigationActionsResult.rows || []
    };
}