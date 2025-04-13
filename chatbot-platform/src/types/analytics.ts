// src/types/analytics.ts
export interface AnalyticsData {
    totalUsers?: number;
    totalChatbots?: number;
    totalConversations: number;
    totalMessages: number;
    activeUsers?: number;
    averageResponseTime: number;
    conversionRate: number;
    totalCartActions?: number;
    timeRange?: number;
    chatbotName?: string;

    // Detailed statistics
    recentActivity?: {
        date: string;
        count: number;
        message_count?: number;
    }[];
    dailyStats?: {
        date: string;
        conversation_count: number;
        message_count: number;
    }[];
    intentDistribution?: {
        intent: string;
        count: number;
    }[];
    topQueries?: {
        message_content: string;
        count: number;
    }[];
    cartOperations?: {
        operation: string;
        count: number;
    }[];
    navigationActions?: {
        target: string;
        count: number;
    }[];

    // Chatbot specific statistics
    chatbotStats?: ChatbotStat[];

    // Admin specific
    topChatbots?: {
        api_key: string;
        name: string;
        user_count: number;
        message_count: number;
    }[];
    topPerformingChatbots?: {
        api_key: string;
        name: string;
        total_users: number;
        conversions: number;
        conversion_rate: string;
    }[];
}

export interface ChatbotStat {
    chatbotId: string;
    apiKey: string;
    name?: string;
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversions: number;
    conversionRate: number;
    dailyStats?: any[];
    topQueries?: any[];
    intentDistribution?: any[];
    cartOperations?: any[];
    navigationActions?: any[];
}

// Chart data types
export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface LineChartDataPoint {
    date: string;
    count: number;
    messages?: number;
}

export interface BarChartDataPoint {
    name: string;
    value: number;
}

export interface PieChartDataPoint {
    name: string;
    value: number;
}
