// src/app/api/analytics/utils/dbUtils.ts
import { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { ChatbotAnalytics } from "../types";
import { analyzeConversationInsights, analyzeConversationFlow } from "./conversationAnalyzer";

export async function getDbClient(): Promise<PoolClient> {
    return await pool.connect();
}

export async function calculateChatbotAnalytics(
    client: PoolClient,
    apiKey: string,
    daysToInclude = 30
): Promise<ChatbotAnalytics & { apiKey: string }> {
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

    // Get top products added to cart with direct product name lookup
    const topProductsResult = await client.query(
        `WITH ProductData AS (
            -- First, let's collect all unique products with counts
            SELECT 
                COALESCE(
                    metadata::jsonb->'action'->>'productId', 
                    metadata::jsonb->'navigationAction'->>'productId'
                ) as product_id,
                COUNT(*) as count
            FROM conversations
            WHERE api_key = $1
            AND metadata::jsonb->'action'->>'type' = 'cart'
            AND metadata::jsonb->'action'->>'operation' = 'add'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
            GROUP BY product_id
            ORDER BY count DESC
            LIMIT 10
         )
         -- For each product, look up the best product name across all conversations
         SELECT 
             pd.product_id,
             -- Look for the best available product name across all conversations
             (
                 SELECT 
                     COALESCE(
                         -- First try to find a conversation with a direct product name
                         (
                             SELECT 
                                 COALESCE(
                                     metadata::jsonb->'action'->>'productName',
                                     metadata::jsonb->'navigationAction'->>'productName'
                                 )
                             FROM conversations
                             WHERE api_key = $1
                             AND (
                                 (metadata::jsonb->'action'->>'productId' = pd.product_id AND metadata::jsonb->'action'->>'productName' IS NOT NULL)
                                 OR
                                 (metadata::jsonb->'navigationAction'->>'productId' = pd.product_id AND metadata::jsonb->'navigationAction'->>'productName' IS NOT NULL)
                             )
                             AND (
                                 metadata::jsonb->'action'->>'productName' != '' 
                                 OR 
                                 metadata::jsonb->'navigationAction'->>'productName' != ''
                             )
                             LIMIT 1
                         ),
                         -- If not found, use the product ID
                         pd.product_id
                     )
             ) as product_name,
             pd.count
         FROM ProductData pd
         ORDER BY pd.count DESC`,
        [apiKey]  // Only pass apiKey once since we use $1 for both places
    );

    // Get detailed cart operations by product with comprehensive product name lookup
    const detailedCartOperationsResult = await client.query(
        `WITH CartData AS (
            -- First, let's collect all unique product operations with counts
            SELECT 
                metadata::jsonb->'action'->>'operation' as operation,
                COALESCE(
                    metadata::jsonb->'action'->>'productId', 
                    metadata::jsonb->'navigationAction'->>'productId'
                ) as product_id,
                COUNT(*) as count
            FROM conversations
            WHERE api_key = $1
            AND metadata::jsonb->'action'->>'type' = 'cart'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
            GROUP BY operation, product_id
            ORDER BY count DESC
            LIMIT 15
         )
         -- For each operation and product, look up the best product name across all conversations
         SELECT 
             cd.operation,
             cd.product_id,
             -- Look for the best available product name across all conversations
             (
                 SELECT 
                     COALESCE(
                         -- First try to find a conversation with a direct product name
                         (
                             SELECT 
                                 COALESCE(
                                     metadata::jsonb->'action'->>'productName',
                                     metadata::jsonb->'navigationAction'->>'productName'
                                 )
                             FROM conversations
                             WHERE api_key = $1
                             AND (
                                 (metadata::jsonb->'action'->>'productId' = cd.product_id AND metadata::jsonb->'action'->>'productName' IS NOT NULL)
                                 OR
                                 (metadata::jsonb->'navigationAction'->>'productId' = cd.product_id AND metadata::jsonb->'navigationAction'->>'productName' IS NOT NULL)
                             )
                             AND (
                                 metadata::jsonb->'action'->>'productName' != '' 
                                 OR 
                                 metadata::jsonb->'navigationAction'->>'productName' != ''
                             )
                             LIMIT 1
                         ),
                         -- If not found, use the product ID
                         cd.product_id
                     )
             ) as product_name,
             cd.count
         FROM CartData cd
         ORDER BY cd.count DESC`,
        [apiKey]  // Only pass apiKey once since we use $1 for both places
    );

    // NEW: Get completed purchases (if purchase tracking via metadata is available)
    const purchasesResult = await client.query(
        `SELECT
             COUNT(*) as count
         FROM conversations
         WHERE api_key = $1
           AND metadata::jsonb->'action'->>'type' = 'purchase'
           AND created_at > NOW() - INTERVAL '${daysToInclude} days'`,
        [apiKey]
    );

    const completedPurchases = parseInt(purchasesResult.rows[0]?.count) || 0;

    // Analyze conversations for insights and flow patterns
    const intentInsights = await analyzeConversationInsights(client, apiKey);
    const conversationFlow = await analyzeConversationFlow(client, apiKey);

    return {
        apiKey, // Include the API key for components that need it
        totalConversations,
        totalMessages,
        averageResponseTime,
        conversions,
        conversionRate,
        completedPurchases,
        dailyStats: dailyStatsResult.rows,
        topQueries: topQueriesResult.rows,
        intentDistribution: intentDistributionResult.rows || [],
        cartOperations: cartOperationsResult.rows || [],
        navigationActions: navigationActionsResult.rows || [],
        topProducts: topProductsResult.rows || [],
        detailedCartOperations: detailedCartOperationsResult.rows || [],
        intentInsights,
        conversationFlow
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