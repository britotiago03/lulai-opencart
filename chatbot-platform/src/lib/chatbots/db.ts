/* src/lib/chatbots/db.ts*/

import { pool, query } from '@/lib/db/client';
import { Chatbot, ChatbotTemplate, Industry } from '@/lib/db/schema';

interface TemplateRow {
    id: string;
    name: string;
    description: string;
    industry: string;
}

interface ResponseRow {
    id: string;
    trigger: string;
    response: string;
    isAI: boolean;
}

interface ChatbotRow {
    id: string;
    name: string;
    description: string;
    industry: string;
    created_at: string;
    updated_at: string;
}

// Templates Service
export async function getTemplatesByIndustry(industry: Industry): Promise<ChatbotTemplate[]> {
    const result = await query<TemplateRow>(`
    SELECT 
      ct.id, 
      ct.name, 
      ct.description, 
      i.name as industry
    FROM chatbot_templates ct
    JOIN industries i ON ct.industry_id = i.id
    WHERE i.name = $1 OR i.name = 'general'
    ORDER BY ct.name
  `, [industry]);

    const templates: ChatbotTemplate[] = [];

    for (const row of result.rows) {
        // Get template responses
        const responsesResult = await query<ResponseRow>(`
      SELECT 
        id, 
        trigger_phrase as trigger, 
        response_text as response, 
        is_ai_enhanced as "isAI"
      FROM chatbot_responses
      WHERE template_id = $1
    `, [row.id]);

        templates.push({
            id: row.id.toString(),
            name: row.name,
            industry: row.industry as Industry,
            description: row.description,
            presetResponses: responsesResult.rows.map(r => ({
                id: r.id.toString(),
                trigger: r.trigger,
                response: r.response,
                isAI: r.isAI
            }))
        });
    }

    return templates;
}

// Chatbots Service
export async function createChatbot(chatbot: Omit<Chatbot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chatbot> {
    // Start transaction
    await query('BEGIN');

    try {
        // Get industry ID
        const industryResult = await query<{ id: number }>(`
      SELECT id FROM industries WHERE name = $1
    `, [chatbot.industry]);

        if (industryResult.rows.length === 0) {
            throw new Error(`Industry ${chatbot.industry} not found`);
        }

        const industryId = industryResult.rows[0].id;

        // Insert chatbot
        const chatbotResult = await query<ChatbotRow>(`
      INSERT INTO chatbots (name, description, industry_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, created_at, updated_at
    `, [chatbot.name, chatbot.description || '', industryId]);

        const newChatbot = chatbotResult.rows[0];

        // Insert responses
        if (chatbot.responses && chatbot.responses.length > 0) {
            for (const response of chatbot.responses) {
                await query(`
          INSERT INTO chatbot_responses (
            chatbot_id, 
            trigger_phrase, 
            response_text, 
            is_ai_enhanced
          )
          VALUES ($1, $2, $3, $4)
        `, [
                    newChatbot.id,
                    response.trigger,
                    response.response,
                    response.isAI || false
                ]);
            }
        }

        await query('COMMIT');

        return {
            id: newChatbot.id.toString(),
            name: newChatbot.name,
            description: newChatbot.description,
            industry: chatbot.industry,
            responses: chatbot.responses || [],
            createdAt: new Date(newChatbot.created_at),
            updatedAt: new Date(newChatbot.updated_at)
        };
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}

export async function getChatbots(): Promise<Chatbot[]> {
    const result = await query<ChatbotRow>(`
    SELECT 
      c.id, 
      c.name, 
      c.description, 
      i.name as industry,
      c.created_at,
      c.updated_at
    FROM chatbots c
    JOIN industries i ON c.industry_id = i.id
    ORDER BY c.created_at DESC
  `);

    const chatbots: Chatbot[] = [];

    for (const row of result.rows) {
        // Get chatbot responses
        const responsesResult = await query<ResponseRow>(`
      SELECT 
        id, 
        trigger_phrase as trigger, 
        response_text as response, 
        is_ai_enhanced as "isAI"
      FROM chatbot_responses
      WHERE chatbot_id = $1
    `, [row.id]);

        chatbots.push({
            id: row.id.toString(),
            name: row.name,
            description: row.description,
            industry: row.industry as Industry,
            responses: responsesResult.rows.map(r => ({
                id: r.id.toString(),
                trigger: r.trigger,
                response: r.response,
                isAI: r.isAI
            })),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }

    return chatbots;
}

export async function getChatbotById(id: string): Promise<Chatbot | null> {
    const result = await query<ChatbotRow>(`
    SELECT 
      c.id, 
      c.name, 
      c.description, 
      i.name as industry,
      c.created_at,
      c.updated_at
    FROM chatbots c
    JOIN industries i ON c.industry_id = i.id
    WHERE c.id = $1
  `, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    // Get chatbot responses
    const responsesResult = await query<ResponseRow>(`
    SELECT 
      id, 
      trigger_phrase as trigger, 
      response_text as response, 
      is_ai_enhanced as "isAI"
    FROM chatbot_responses
    WHERE chatbot_id = $1
  `, [row.id]);

    return {
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        industry: row.industry as Industry,
        responses: responsesResult.rows.map(r => ({
            id: r.id.toString(),
            trigger: r.trigger,
            response: r.response,
            isAI: r.isAI
        })),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    };
}

export async function updateChatbot(
    id: string,
    data: {
        name: string;
        description?: string;
        industry: string;
        responses: {
            id: string;
            trigger: string;
            response: string;
            isAI: boolean;
        }[];
    }
): Promise<Chatbot> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get the industry ID
        const industryResult = await client.query<{ id: number }>(
            `
            SELECT id FROM industries WHERE name = $1
        `,
            [data.industry]
        );

        const industryId = industryResult.rows[0]?.id;
        if (!industryId) {
            throw new Error(`Industry ${data.industry} not found`);
        }

        // Update the chatbot
        const chatbotResult = await client.query<Chatbot>(
            `
            UPDATE chatbots 
            SET name = $1, description = $2, industry_id = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, description, created_at, updated_at
        `,
            [data.name, data.description || null, industryId, id]
        );

        // Get existing responses to check if they're in use
        const existingResponsesResult = await client.query<{ id: number, in_use: boolean }>(
            `
            SELECT 
                cr.id, 
                EXISTS (
                    SELECT 1 FROM conversation_messages 
                    WHERE response_id = cr.id
                ) as in_use
            FROM chatbot_responses cr
            WHERE cr.chatbot_id = $1
        `,
            [id]
        );

        const existingResponseMap = new Map<string, boolean>();
        existingResponsesResult.rows.forEach(row => {
            existingResponseMap.set(row.id.toString(), row.in_use);
        });

        // Process responses: keep track of which ones to keep
        const responsesToKeep = new Set<string>();

        // Insert or update responses
        for (const response of data.responses) {
            if (response.id.startsWith('temp-')) {
                // This is a new response, insert it
                await client.query(
                    `
                INSERT INTO chatbot_responses (
                    chatbot_id, trigger_phrase, response_text, is_ai_enhanced
                ) VALUES ($1, $2, $3, $4)
            `,
                    [id, response.trigger, response.response, response.isAI]
                );
            } else {
                // Existing response, update it
                responsesToKeep.add(response.id);

                await client.query(
                    `
                UPDATE chatbot_responses
                SET trigger_phrase = $1, response_text = $2, is_ai_enhanced = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4 AND chatbot_id = $5
            `,
                    [response.trigger, response.response, response.isAI, response.id, id]
                );
            }
        }

        // Delete responses that aren't being kept AND aren't referenced in conversation_messages
        for (const [responseId, inUse] of existingResponseMap.entries()) {
            if (!responsesToKeep.has(responseId) && !inUse) {
                await client.query(
                    `
                DELETE FROM chatbot_responses
                WHERE id = $1 AND chatbot_id = $2
            `,
                    [responseId, id]
                );
            }
        }

        await client.query('COMMIT');
        return chatbotResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating chatbot:", error);
        throw error;
    } finally {
        client.release();
    }
}

export async function deleteChatbot(id: string): Promise<void> {
    // Start transaction
    await query('BEGIN');

    try {
        // Delete any conversation_messages referencing chatbot_responses from this chatbot
        await query(`
      DELETE FROM conversation_messages
      WHERE response_id IN (
        SELECT id FROM chatbot_responses WHERE chatbot_id = $1
      )
    `, [id]);

        // Delete conversation-related data (in correct order)
        await query(`
      DELETE FROM chatbot_feedback
      WHERE message_id IN (
        SELECT cm.id FROM conversation_messages cm
        JOIN conversations c ON cm.conversation_id = c.id
        WHERE c.chatbot_id = $1
      )
    `, [id]);

        await query(`
      DELETE FROM conversation_messages
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE chatbot_id = $1
      )
    `, [id]);

        await query(`
      DELETE FROM conversations
      WHERE chatbot_id = $1
    `, [id]);

        // Now delete the responses and the chatbot
        await query(`
      DELETE FROM chatbot_responses
      WHERE chatbot_id = $1
    `, [id]);

        await query(`
      DELETE FROM chatbots
      WHERE id = $1
    `, [id]);

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}