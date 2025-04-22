export interface IntentItem   { intent:  string; count: number }
export interface DailyItem    { date:    string; count: number; messages: number }
export interface CartOpItem   { operation: string; count: number }
export interface NavAction    { target: string; count: number }

export interface ChatbotStat {
    name: string;
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    conversions: number;
    conversionRate: number;
}

export interface AnalyticsData {
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversionRate: number;
    conversions?: number;
    recentActivity?: DailyItem[];
    dailyStats?: DailyItem[];
    intentDistribution?: IntentItem[];
    topQueries?: { message_content: string; count: number }[];
    cartOperations?: CartOpItem[];
    navigationActions?: NavAction[];
    chatbotStats?: ChatbotStat[];
    topPerformingChatbots?: ChatbotStat[];
    totalCartActions?: number;
    chatbotName?: string;
}
