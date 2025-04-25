// src/app/api/analytics/services/clientService.ts
import { PoolClient } from "pg";
import { calculateChatbotAnalytics, updateAnalyticsRecord } from "../utils/dbUtils";
import { ClientAnalytics, ChatbotStat } from "../types";

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

    return {
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
    };
}