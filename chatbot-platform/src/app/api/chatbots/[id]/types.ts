import { Chatbot } from "../types";

export interface ChatbotWithWidget extends Chatbot {
    widget: WidgetConfig | null;
}

export interface WidgetConfig {
    id: string;
    chatbot_id: string;
    primary_color?: string;
    secondary_color?: string;
    button_size?: string;
    window_width?: string;
    window_height?: string;
    header_text?: string;
    font_family?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ChatbotUpdateInput {
    name: string;
    description: string;
}