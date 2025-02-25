/* chatbot-platform/src/lib/chatbots/types.ts */
export interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: Industry;
    responses: ChatbotResponse[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatbotResponse {
    id: string;
    trigger: string;  // Keywords or phrases that trigger this response
    response: string; // The actual response text
    isAI: boolean;    // Whether to use AI for dynamic responses
}

export type Industry = 'fashion' | 'electronics' | 'general' | 'food' | 'beauty';

export interface ChatbotTemplate {
    id: string;
    name: string;
    industry: Industry;
    description: string;
    presetResponses: ChatbotResponse[];
}