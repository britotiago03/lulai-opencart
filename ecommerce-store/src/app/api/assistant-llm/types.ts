// Action Types
export type NavigationAction = {
    type: 'navigate';
    path: string;
};

export type ProductSearchAction = {
    type: 'search';
    query: string;
};

export type Action = NavigationAction | ProductSearchAction | null;

// Unvalidated action object from LLM response
export interface UnvalidatedAction {
    type?: string;
    path?: string;
    query?: string;
    [key: string]: unknown;
}

// Product interface
export interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    [key: string]: unknown;
}

// OpenAI API Types
export type Role = "system" | "user" | "assistant";

export interface Message {
    role: Role;
    content: string;
}

export interface OpenAIRequest {
    model: string;
    messages: Message[];
    response_format?: { type: string };
}

export interface OpenAIChoice {
    message: { content: string | null };
}

export interface OpenAIResponse {
    choices: OpenAIChoice[];
}

// Response structure
export interface AssistantResponse {
    response: string;
    action?: UnvalidatedAction;
}