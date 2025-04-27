import { PoolClient } from "pg";
import {
    getChatbotByApiKey,
    getAllChatbotsForAdmin,
    getUserChatbots,
    createChatbot,
    beginTransaction,
    commitTransaction,
    rollbackTransaction
} from "../utils/dbUtils";
import { Chatbot, AdminChatbot, ChatbotCreateInput } from "../types";

export async function fetchChatbotByApiKey(
    client: PoolClient,
    apiKey: string,
    userId?: string
): Promise<Chatbot | null> {
    return await getChatbotByApiKey(client, apiKey, userId);
}

export async function fetchChatbots(
    client: PoolClient,
    isAdmin: boolean,
    userId: string
): Promise<(Chatbot | AdminChatbot)[]> {
    if (isAdmin) {
        return await getAllChatbotsForAdmin(client);
    } else {
        return await getUserChatbots(client, userId);
    }
}

export async function createNewChatbot(
    client: PoolClient,
    chatbotData: ChatbotCreateInput,
    userId: string
): Promise<{ success: boolean; chatbot?: Chatbot; message?: string }> {
    try {
        await beginTransaction(client);

        const newChatbot = await createChatbot(client, chatbotData, userId);

        // Now communicate with the lulai-chatbot service to store the chatbot data
        const chatbotServiceUrl = process.env.CHATBOT_SERVICE_URL;

        if (!chatbotServiceUrl) {
            await rollbackTransaction(client);
            return {
                success: false,
                message: "Chatbot service URL not configured"
            };
        }

        try {
            const lulaiChatbotResponse = await fetch(`${chatbotServiceUrl}/api/storage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeName: chatbotData.storeName,
                    productApiUrl: chatbotData.productApiUrl,
                    platform: chatbotData.platform,
                    apiKey: chatbotData.apiKey,
                    customPrompt: chatbotData.customPrompt
                }),
            });

            if (!lulaiChatbotResponse.ok) {
                // Rollback if the external service call fails
                await rollbackTransaction(client);
                return {
                    success: false,
                    message: "Failed to create chatbot integration"
                };
            }

            // Commit transaction
            await commitTransaction(client);

            return {
                success: true,
                chatbot: newChatbot
            };
        } catch (fetchError) {
            await rollbackTransaction(client);
            console.error("Error contacting chatbot service:", fetchError);
            return {
                success: false,
                message: "Failed to contact chatbot integration service"
            };
        }
    } catch (error) {
        await rollbackTransaction(client);
        console.error("Error creating chatbot:", error);
        return {
            success: false,
            message: "Failed to create chatbot"
        };
    }
}