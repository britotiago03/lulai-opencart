// src/types/conversation.ts
export interface Conversation {
    id: string;
    api_key: string;
    user_id: string;
    message_role: string;
    message_content: string;
    chatbot_name?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface Message {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}

export interface ChatbotInfo {
    id: string;
    name: string;
    api_key: string;
    platform: string;
    industry: string;
    created_at: string;
}