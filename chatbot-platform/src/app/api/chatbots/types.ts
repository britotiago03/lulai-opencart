export interface Chatbot {
    id: string;
    name: string;
    description: string;
    api_key: string;
    industry: string;
    platform: string;
    product_api_url: string;
    custom_prompt: string | null;
    user_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface AdminChatbot extends Chatbot {
    user_name: string;
    user_email: string;
}

export interface ChatbotCreateInput {
    storeName: string;
    productApiUrl: string;
    platform: string;
    apiKey: string;
    industry: string;
    customPrompt?: string;
}

export interface SessionData {
    user: {
        id: string;
        role: string;
    };
}