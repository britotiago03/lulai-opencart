// src/app/api/analytics/services/chatbotService.ts
import { PoolClient } from "pg";
import { calculateChatbotAnalytics, updateAnalyticsRecord } from "../utils/dbUtils";
import { ChatbotAnalytics } from "../types";

export async function getSingleChatbotAnalytics(
    client: PoolClient,
    apiKey: string,
    chatbotId: string,
    chatbotName: string,
    daysToInclude: number
): Promise<ChatbotAnalytics & { chatbotName: string }> {
    // Calculate analytics for this chatbot
    const chatbotAnalytics = await calculateChatbotAnalytics(client, apiKey, daysToInclude);

    // Update analytics record
    await updateAnalyticsRecord(client, chatbotId, chatbotAnalytics);

    return {
        ...chatbotAnalytics,
        chatbotName
    };
}