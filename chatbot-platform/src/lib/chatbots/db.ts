/* src/lib/chatbots/db.ts*/

import { query } from '@/lib/db/client';
import { Chatbot, ChatbotResponse, ChatbotTemplate, Industry } from '@/lib/db/schema';

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

export async function updateChatbot(id: string, chatbot: Omit<Chatbot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chatbot> {
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

        // Update chatbot
        const chatbotResult = await query<{ id: string, name: string, description: string, industry: string, created_at: string, updated_at: string }>(`
            UPDATE chatbots 
            SET name = $1, description = $2, industry_id = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, description, created_at, updated_at
        `, [chatbot.name, chatbot.description || '', industryId, id]);

        if (chatbotResult.rows.length === 0) {
            throw new Error(`Chatbot with ID ${id} not found`);
        }

        // Delete existing responses
        await query(`
            DELETE FROM chatbot_responses
            WHERE chatbot_id = $1
        `, [id]);

        // Insert new responses
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
                    id,
                    response.trigger,
                    response.response,
                    response.isAI || false
                ]);
            }
        }

        // Get the updated chatbot with industry name
        const updatedChatbot = await getChatbotById(id);
        if (!updatedChatbot) {
            throw new Error(`Failed to retrieve updated chatbot with ID ${id}`);
        }

        await query('COMMIT');
        return updatedChatbot;
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}

export async function deleteChatbot(id: string): Promise<void> {
    // Start transaction
    await query('BEGIN');

    try {
        // Delete responses first (should cascade, but being explicit)
        await query(`
            DELETE FROM chatbot_responses
            WHERE chatbot_id = $1
        `, [id]);

        // Delete the chatbot
        const result = await query(`
            DELETE FROM chatbots
            WHERE id = $1
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            throw new Error(`Chatbot with ID ${id} not found`);
        }

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}