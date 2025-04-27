// src/types/dashboard.ts

export interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
    chatbot_name?: string;
}

export interface DashboardStats {
    totalChatbots: number;
    totalConversations: number;
    conversionRate: number;
    averageResponseTime: number;
}