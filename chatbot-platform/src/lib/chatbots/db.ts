// chatbot-platform/src/lib/db/client.ts
import { pool, query } from '@/lib/db/client';
import { Chatbot, Industry } from '@/lib/db/schema';

interface ChatbotRow {
    id: string;
    name: string;
    industry: string;
    platform: string;
    api_url: string | null;
    api_key: string | null;
    custom_prompt: string | null;
    created_at: string;
    updated_at: string;
}

// Chatbots Service
export async function createChatbot(chatbot: Omit<Chatbot, 'id' | 'createdAt' | 'updatedAt'> & { apiUrl?: string; apiKey?: string; customPrompt?: string; platform: string }): Promise<Chatbot> {
    await query('BEGIN');
    try {
        // Ensure industry exists or create it
        let industryResult = await query<{ id: number }>(`SELECT id FROM industries WHERE name = $1`, [chatbot.industry]);
        
        if (industryResult.rows.length === 0) {
            const newIndustry = await query<{ id: number }>(
                `INSERT INTO industries (name) VALUES ($1) RETURNING id`, 
                [chatbot.industry]
            );
            industryResult = newIndustry;
        }

        const industryId = industryResult.rows[0].id;

        // Insert chatbot
        const chatbotResult = await query<ChatbotRow>(
            `INSERT INTO chatbots (name, industry_id, platform, api_url, api_key, custom_prompt) 
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, platform, api_url, api_key, custom_prompt, created_at, updated_at`,
            [chatbot.name, industryId, chatbot.platform, chatbot.apiUrl || null, chatbot.apiKey || null, chatbot.customPrompt || null]
        );

        const newChatbot = chatbotResult.rows[0];

        await query('COMMIT');
        return {
            id: newChatbot.id.toString(),
            name: newChatbot.name,
            industry: chatbot.industry,
            platform: newChatbot.platform,
            apiUrl: newChatbot.api_url || null,
            apiKey: newChatbot.api_key || null,
            customPrompt: newChatbot.custom_prompt || null,
            createdAt: new Date(newChatbot.created_at),
            updatedAt: new Date(newChatbot.updated_at)
        };
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}

export async function getChatbots(): Promise<Chatbot[]> {
    const result = await query<ChatbotRow>(
        `SELECT c.id, c.name, i.name as industry, c.platform, c.api_url, c.api_key, c.custom_prompt, c.created_at, c.updated_at
         FROM chatbots c
         JOIN industries i ON c.industry_id = i.id
         ORDER BY c.created_at DESC`
    );

    return result.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        industry: row.industry as Industry,
        platform: row.platform,
        apiUrl: row.api_url || null,
        apiKey: row.api_key || null,
        customPrompt: row.custom_prompt || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    }));
}

export async function getChatbotById(id: string): Promise<Chatbot | null> {
    const result = await query<ChatbotRow>(
        `SELECT c.id, c.name, i.name as industry, c.platform, c.api_url, c.api_key, c.custom_prompt, c.created_at, c.updated_at
         FROM chatbots c
         JOIN industries i ON c.industry_id = i.id
         WHERE c.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id.toString(),
        name: row.name,
        industry: row.industry as Industry,
        platform: row.platform,
        apiUrl: row.api_url || null,
        apiKey: row.api_key || null,
        customPrompt: row.custom_prompt || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    };
}

export async function deleteChatbot(id: string): Promise<void> {
    await query('BEGIN');
    try {
        await query(`DELETE FROM chatbot_responses WHERE chatbot_id = $1`, [id]);
        await query(`DELETE FROM chatbots WHERE id = $1`, [id]);
        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}

export async function updateChatbot(
    id: string,
    chatbot: Omit<Chatbot, 'id' | 'createdAt' | 'updatedAt'> & { apiUrl?: string; apiKey?: string; customPrompt?: string; platform: string }
): Promise<Chatbot> {
    await query('BEGIN');
    try {
        // Ensure the industry exists or create it if necessary
        let industryResult = await query<{ id: number }>(`SELECT id FROM industries WHERE name = $1`, [chatbot.industry]);
        if (industryResult.rows.length === 0) {
            const newIndustry = await query<{ id: number }>(
                `INSERT INTO industries (name) VALUES ($1) RETURNING id`,
                [chatbot.industry]
            );
            industryResult = newIndustry;
        }
        const industryId = industryResult.rows[0].id;

        // Update the chatbot record
        const updateResult = await query<ChatbotRow>(
            `UPDATE chatbots
             SET name = $1,
                 custom_prompt = $2,
                 updated_at = NOW()
             WHERE id = $3
             RETURNING id, name, custom_prompt, created_at, updated_at`,
            [chatbot.name, chatbot.customPrompt || null, id]
        );
        
        const updated = updateResult.rows[0];

        await query('COMMIT');
        return {
            id: updated.id.toString(),
            name: updated.name,
            industry: chatbot.industry,
            platform: chatbot.platform,
            customPrompt: updated.custom_prompt || null,
            createdAt: new Date(updated.created_at),
            updatedAt: new Date(updated.updated_at)
        };
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}
