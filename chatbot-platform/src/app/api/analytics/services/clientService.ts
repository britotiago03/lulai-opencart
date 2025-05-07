// src/app/api/analytics/services/clientService.ts
import { PoolClient } from "pg";
import { calculateChatbotAnalytics, updateAnalyticsRecord } from "../utils/dbUtils";
import { ClientAnalytics, ChatbotStat } from "../types";
import { analyzeConversationInsights, analyzeConversationFlow } from "../utils/conversationAnalyzer";

export async function getClientAnalytics(
    client: PoolClient,
    userId: string,
    daysToInclude: number
): Promise<ClientAnalytics> {
    // Get all chatbots for this user
    const chatbotsResult = await client.query(
        "SELECT id, api_key, name FROM chatbots WHERE user_id = $1",
        [userId]
    );

    if (chatbotsResult.rows.length === 0) {
        // User has no chatbots yet
        return {
            totalChatbots: 0,
            totalConversations: 0,
            totalMessages: 0,
            averageResponseTime: 0,
            conversionRate: 0,
            recentActivity: [],
            intentDistribution: [],
            topQueries: [],
            chatbotStats: [],
            timeRange: daysToInclude
        };
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
        await updateAnalyticsRecord(client, row.id, chatbotAnalytics);
    }

    // Get recent activity for all user's chatbots with message counts
    const recentActivity = await client.query(`
        SELECT 
            DATE(created_at) as date, 
            COUNT(DISTINCT user_id || api_key) as conversation_count,
            COUNT(*) as message_count
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
        WHERE api_key = ANY($1)
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
    
    // NEW: Get top products added to cart across all chatbots with improved naming
    const topProductsResult = await client.query(`
        WITH ProductData AS (
            SELECT 
                metadata::jsonb->'action'->>'productId' as product_id,
                metadata::jsonb->'action'->>'productName' as product_name,
                COUNT(*) as count
            FROM conversations
            WHERE api_key = ANY($1)
            AND metadata::jsonb->'action'->>'type' = 'cart'
            AND metadata::jsonb->'action'->>'operation' = 'add'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
            GROUP BY product_id, product_name
            ORDER BY count DESC
            LIMIT 10
        ),
        ProductLookup AS (
            SELECT DISTINCT 
                metadata::jsonb->'action'->>'productId' as pid, 
                metadata::jsonb->'action'->>'productName' as pname
            FROM conversations 
            WHERE api_key = ANY($1)
            AND metadata::jsonb->'action'->>'productName' IS NOT NULL 
            AND metadata::jsonb->'action'->>'productName' != ''
        )
        SELECT 
            CASE 
                WHEN product_name IS NOT NULL AND product_name != '' THEN product_name
                WHEN product_id IS NOT NULL THEN (
                    -- Try to find a product name from another record with the same ID
                    SELECT pname FROM ProductLookup
                    WHERE pid = product_id
                    LIMIT 1
                )
                ELSE CONCAT('Product ID: ', product_id)
            END as product_name,
            product_id,
            count
        FROM ProductData
        ORDER BY count DESC
    `, [apiKeys]);

    // NEW: Get detailed cart operations by product across all chatbots with improved naming
    const detailedCartOperationsResult = await client.query(`
        WITH CartData AS (
            SELECT 
                metadata::jsonb->'action'->>'operation' as operation,
                metadata::jsonb->'action'->>'productId' as product_id,
                metadata::jsonb->'action'->>'productName' as product_name,
                COUNT(*) as count
            FROM conversations
            WHERE api_key = ANY($1)
            AND metadata::jsonb->'action'->>'type' = 'cart'
            AND created_at > NOW() - INTERVAL '${daysToInclude} days'
            GROUP BY operation, product_id, product_name
            ORDER BY count DESC
            LIMIT 15
        ),
        ProductLookup AS (
            SELECT DISTINCT 
                metadata::jsonb->'action'->>'productId' as pid, 
                metadata::jsonb->'action'->>'productName' as pname
            FROM conversations 
            WHERE api_key = ANY($1)
            AND metadata::jsonb->'action'->>'productName' IS NOT NULL 
            AND metadata::jsonb->'action'->>'productName' != ''
        )
        SELECT 
            operation,
            CASE 
                WHEN product_name IS NOT NULL AND product_name != '' THEN product_name
                WHEN product_id IS NOT NULL THEN (
                    -- Try to find a product name from another record with the same ID
                    SELECT pname FROM ProductLookup
                    WHERE pid = product_id
                    LIMIT 1
                )
                ELSE CONCAT('Product ID: ', product_id)
            END as product_name,
            product_id,
            count
        FROM CartData
        ORDER BY count DESC
    `, [apiKeys]);

    // NEW: Get completed purchases (if purchase tracking via metadata is available)
    const purchasesResult = await client.query(`
        SELECT
            COUNT(*) as count
        FROM conversations
        WHERE api_key = ANY($1)
        AND metadata::jsonb->'action'->>'type' = 'purchase'
        AND created_at > NOW() - INTERVAL '${daysToInclude} days'
    `, [apiKeys]);

    const completedPurchases = parseInt(purchasesResult.rows[0]?.count) || 0;

    // Analyze conversations for insights and flow patterns
    // Since this is for all chatbots, we'll choose the most active one for analysis
    // or analyze them all if there's just a few
    let intentInsights = [];
    let conversationFlow = [];

    if (apiKeys.length > 0) {
        // If more than 3 chatbots, just use the first one for insights
        // to avoid excessive processing
        if (apiKeys.length <= 3) {
            // For fewer chatbots, analyze each and combine results
            for (const apiKey of apiKeys) {
                const insights = await analyzeConversationInsights(client, apiKey);
                const flow = await analyzeConversationFlow(client, apiKey);
                
                if (insights.length > 0 && intentInsights.length === 0) {
                    intentInsights = insights;
                }
                
                if (flow.length > 0 && conversationFlow.length === 0) {
                    conversationFlow = flow;
                }
            }
        } else {
            // For many chatbots, just use the first one
            intentInsights = await analyzeConversationInsights(client, apiKeys[0]);
            conversationFlow = await analyzeConversationFlow(client, apiKeys[0]);
        }
    }

    // Calculate totals and averages
    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    const conversionRate = totalConversations > 0 ? (totalConversions / totalConversations) * 100 : 0;

    return {
        totalChatbots: chatbotIds.length,
        totalConversations,
        totalMessages,
        averageResponseTime,
        conversionRate,
        completedPurchases,
        recentActivity: recentActivity.rows,
        intentDistribution: intentDistribution.rows,
        topQueries: topQueries.rows,
        topProducts: topProductsResult.rows || [],
        detailedCartOperations: detailedCartOperationsResult.rows || [],
        intentInsights,
        conversationFlow,
        chatbotStats,
        timeRange: daysToInclude
    };
}