import { PoolClient } from "pg";
import {
    getChatbotWithWidget,
    updateChatbot,
    getChatbotApiKey,
    deleteChatbotAndRelated
} from "../utils/dbUtils";
import { ChatbotWithWidget, ChatbotUpdateInput } from "../types";
import { Chatbot } from "../../types";
import { beginTransaction, commitTransaction, rollbackTransaction } from "../../utils/dbUtils";

export async function fetchChatbotWithWidget(
    client: PoolClient,
    chatbotId: string,
    isAdmin: boolean,
    userId: string
): Promise<ChatbotWithWidget | null> {
    // If not admin, pass userId to check ownership
    const userIdParam = !isAdmin ? userId : undefined;
    return await getChatbotWithWidget(client, chatbotId, userIdParam);
}

export async function updateChatbotDetails(
    client: PoolClient,
    chatbotId: string,
    updateData: ChatbotUpdateInput,
    isAdmin: boolean,
    userId: string
): Promise<{ success: boolean; chatbot?: Chatbot; message?: string }> {
    try {
        // Verify ownership first
        const userIdParam = !isAdmin ? userId : undefined;
        const chatbot = await getChatbotWithWidget(client, chatbotId, userIdParam);

        if (!chatbot) {
            return {
                success: false,
                message: "Chatbot not found or unauthorized"
            };
        }

        const updatedChatbot = await updateChatbot(client, chatbotId, updateData);

        return {
            success: true,
            chatbot: updatedChatbot || undefined
        };
    } catch (error) {
        console.error("Error updating chatbot:", error);
        return {
            success: false,
            message: "Failed to update chatbot"
        };
    }
}

export async function deleteChatbot(
    client: PoolClient,
    chatbotId: string,
    isAdmin: boolean,
    userId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await beginTransaction(client);

        // Verify ownership first
        const userIdParam = !isAdmin ? userId : undefined;
        const apiKey = await getChatbotApiKey(client, chatbotId, userIdParam);

        if (!apiKey) {
            await rollbackTransaction(client);
            return {
                success: false,
                message: "Chatbot not found or unauthorized"
            };
        }

        // Perform deletion
        await deleteChatbotAndRelated(client, chatbotId);

        // Commit transaction
        await commitTransaction(client);

        return {
            success: true,
            message: "Chatbot deleted successfully"
        };
    } catch (error) {
        await rollbackTransaction(client);
        console.error("Error deleting chatbot:", error);
        return {
            success: false,
            message: "Failed to delete chatbot"
        };
    }
}