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