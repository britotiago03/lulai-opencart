// src/app/api/analytics/services/adminService.ts
import { PoolClient } from "pg";
import { AdminAnalytics } from "../types";

export async function getAdminAnalytics(
    client: PoolClient,
    daysToInclude: number
): Promise<AdminAnalytics> {
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

    // NEW: Get top products
    const topProductsResult = await client.query(`
        SELECT
            COALESCE(metadata::jsonb->'action'->>'productName', 
                    CONCAT('Product ID: ', metadata::jsonb->'action'->>'productId')) as product_name,
            metadata::jsonb->'action'->>'productId' as product_id,
            COUNT(*) as count
        FROM conversations
        WHERE metadata::jsonb->'action'->>'type' = 'cart'
            AND metadata::jsonb->'action'->>'operation' = 'add'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
        GROUP BY product_name, product_id
        ORDER BY count DESC
        LIMIT 10
    `);

    // NEW: Get detailed cart operations
    const detailedCartOperationsResult = await client.query(`
        SELECT
            metadata::jsonb->'action'->>'operation' as operation,
            COALESCE(metadata::jsonb->'action'->>'productName', 
                    CONCAT('Product ID: ', metadata::jsonb->'action'->>'productId')) as product_name,
            metadata::jsonb->'action'->>'productId' as product_id,
            COUNT(*) as count
        FROM conversations
        WHERE metadata::jsonb->'action'->>'type' = 'cart'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
        GROUP BY operation, product_name, product_id
        ORDER BY count DESC
        LIMIT 15
    `);

    // NEW: Get completed purchases
    const purchasesResult = await client.query(`
        SELECT COUNT(*) as count
        FROM conversations
        WHERE metadata::jsonb->'action'->>'type' = 'purchase'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
    `);

    const completedPurchases = parseInt(purchasesResult.rows[0]?.count) || 0;

    return {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalChatbots: parseInt(totalChatbots.rows[0].count),
        totalConversations,
        totalCartActions,
        conversionRate: totalConversations > 0 ? (totalCartActions / totalConversations) * 100 : 0,
        averageConversationsPerChatbot: parseFloat(averageQuery.rows[0].avg_conversations) || 0,
        averageMessagesPerChatbot: parseFloat(averageQuery.rows[0].avg_messages) || 0,
        averageConversionRate: parseFloat(averageQuery.rows[0].avg_conversion) || 0,
        completedPurchases,
        recentActivity: recentActivity.rows,
        intentDistribution: intentDistribution.rows,
        topQueries: topQueriesResult.rows,
        topProducts: topProductsResult.rows || [],
        detailedCartOperations: detailedCartOperationsResult.rows || [],
        topChatbots: topChatbots.rows,
        topPerformingChatbots: topPerformingChatbots.rows,
        timeRange: daysToInclude
    };
}
