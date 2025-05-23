// src/types/chatbot.ts
export interface Chatbot {
    id: string;
    name: string;
    description: string;
    api_key: string;
    industry: string;
    platform: string;
    product_api_url: string;
    custom_prompt: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

// Extended interface for the admin dashboard which includes additional fields
export interface ChatbotWithStats extends Chatbot {
    userName: string;
    userEmail: string;
    status: "active" | "inactive" | "error";
    conversationCount: number;
    lastActive: string;
    api_key: string; // Add this to ensure it's available for linking to conversations
}