// src/types/conversation.ts
export interface Conversation {
    id: string;
    api_key: string;
    user_id: string;
    message_role: string;
    message_content: string;
    metadata?: any;
    created_at: string;
}