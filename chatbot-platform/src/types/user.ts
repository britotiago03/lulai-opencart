// src/types/user.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    chatbotCount: number;
    lastActive: string;
}