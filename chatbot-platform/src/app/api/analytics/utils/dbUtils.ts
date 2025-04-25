// src/app/api/analytics/utils/dbUtils.ts
import { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { ChatbotAnalytics } from "../types";

export async function getDbClient(): Promise<PoolClient> {
    return await pool.connect();
}

export async function calculateChatbotAnalytics(
    client: PoolClient,
    apiKey: string,
    daysToInclude = 30
): Promise<ChatbotAnalytics> {
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

export async function updateAnalyticsRecord(
    client: PoolClient,
    chatbotId: string,
    analytics: ChatbotAnalytics
): Promise<void> {
    await client.query(
        `UPDATE analytics
         SET conversation_count = $1,
             message_count = $2,
             avg_response_time = $3,
             conversion_rate = $4,
             updated_at = NOW()
         WHERE chatbot_id = $5`,
        [
            analytics.totalConversations,
            analytics.totalMessages,
            analytics.averageResponseTime,
            analytics.conversionRate,
            chatbotId
        ]
    );
}