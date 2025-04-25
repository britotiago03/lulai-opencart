import { PoolClient } from "pg";
import { Chatbot } from "../../types";
import { ChatbotWithWidget, WidgetConfig, ChatbotUpdateInput } from "../types";

export async function getChatbotById(
    client: PoolClient,
    chatbotId: string,
    userId?: string
): Promise<Chatbot | null> {
    let query = "SELECT * FROM chatbots WHERE id = $1";
    const params: Array<string> = [chatbotId];

    // If userId is provided, restrict to chatbots owned by this user
    if (userId) {
        query += " AND user_id = $2";
        params.push(userId);
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function getWidgetConfigById(
    client: PoolClient,
    chatbotId: string
): Promise<WidgetConfig | null> {
    const result = await client.query(
        "SELECT * FROM widget_configs WHERE chatbot_id = $1",
        [chatbotId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function getChatbotWithWidget(
    client: PoolClient,
    chatbotId: string,
    userId?: string
): Promise<ChatbotWithWidget | null> {
    const chatbot = await getChatbotById(client, chatbotId, userId);

    if (!chatbot) {
        return null;
    }

    const widget = await getWidgetConfigById(client, chatbotId);

    return {
        ...chatbot,
        widget
    };
}

export async function updateChatbot(
    client: PoolClient,
    chatbotId: string,
    updateData: ChatbotUpdateInput
): Promise<Chatbot | null> {
    const result = await client.query(
        `UPDATE chatbots 
         SET name = $1, 
             description = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [updateData.name, updateData.description, chatbotId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function deleteChatbotAndRelated(
    client: PoolClient,
    chatbotId: string
): Promise<void> {
    // Delete related records
    await client.query("DELETE FROM widget_configs WHERE chatbot_id = $1", [chatbotId]);
    await client.query("DELETE FROM analytics WHERE chatbot_id = $1", [chatbotId]);

    // Delete main chatbot record
    await client.query("DELETE FROM chatbots WHERE id = $1", [chatbotId]);
}

export async function getChatbotApiKey(
    client: PoolClient,
    chatbotId: string,
    userId?: string
): Promise<string | null> {
    let query = "SELECT api_key FROM chatbots WHERE id = $1";
    const params: Array<string> = [chatbotId];

    if (userId) {
        query += " AND user_id = $2";
        params.push(userId);
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].api_key;
}