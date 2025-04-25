import { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { Chatbot, AdminChatbot, ChatbotCreateInput } from "../types";

export async function getDbClient(): Promise<PoolClient> {
    return await pool.connect();
}

export async function getChatbotByApiKey(
    client: PoolClient,
    apiKey: string,
    userId?: string
): Promise<Chatbot | null> {
    let query = "SELECT * FROM chatbots WHERE api_key = $1";
    const params: Array<string> = [apiKey];

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

export async function getAllChatbotsForAdmin(
    client: PoolClient
): Promise<AdminChatbot[]> {
    const result = await client.query(`
        SELECT c.*, u.name as user_name, u.email as user_email 
        FROM chatbots c 
        JOIN users u ON c.user_id = u.id 
        ORDER BY c.created_at DESC
    `);

    return result.rows;
}

export async function getUserChatbots(
    client: PoolClient,
    userId: string
): Promise<Chatbot[]> {
    const result = await client.query(
        "SELECT * FROM chatbots WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
    );

    return result.rows;
}

export async function createChatbot(
    client: PoolClient,
    chatbotData: ChatbotCreateInput,
    userId: string
): Promise<Chatbot> {
    // Insert chatbot record
    const chatbotResult = await client.query(
        `INSERT INTO chatbots (
            name, description, api_key, industry, platform, product_api_url, 
            custom_prompt, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
            chatbotData.storeName,
            `Chatbot for ${chatbotData.storeName}`,
            chatbotData.apiKey,
            chatbotData.industry,
            chatbotData.platform,
            chatbotData.productApiUrl,
            chatbotData.customPrompt || null,
            userId
        ]
    );

    const newChatbot = chatbotResult.rows[0];

    // Create widget config for the chatbot
    await client.query(
        `INSERT INTO widget_configs (chatbot_id) VALUES ($1)`,
        [newChatbot.id]
    );

    // Create analytics record for the chatbot
    await client.query(
        `INSERT INTO analytics (chatbot_id) VALUES ($1)`,
        [newChatbot.id]
    );

    return newChatbot;
}

export async function beginTransaction(client: PoolClient): Promise<void> {
    await client.query('BEGIN');
}

export async function commitTransaction(client: PoolClient): Promise<void> {
    await client.query('COMMIT');
}

export async function rollbackTransaction(client: PoolClient): Promise<void> {
    await client.query('ROLLBACK');
}