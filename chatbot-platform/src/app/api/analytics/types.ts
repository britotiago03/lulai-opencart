// src/app/api/analytics/types.ts
export interface DailyStats {
    date: string;
    conversation_count: number;
    message_count: number;
}

export interface QueryCount {
    message_content: string;
    count: number;
}

export interface IntentCount {
    intent: string;
    count: number;
}

export interface CartOperation {
    operation: string;
    count: number;
}

export interface NavigationAction {
    target: string;
    count: number;
}

export interface ChatbotAnalytics {
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversions: number;
    conversionRate: number;
    dailyStats: DailyStats[];
    topQueries: QueryCount[];
    intentDistribution: IntentCount[];
    cartOperations: CartOperation[];
    navigationActions: NavigationAction[];
}

export interface ChatbotStat extends ChatbotAnalytics {
    chatbotId: string;
    apiKey: string;
    name?: string;
}

export interface RecentActivity {
    date: string;
    count: number;
}

export interface TopChatbot {
    api_key: string;
    name: string;
    user_count: number;
    message_count: number;
}

export interface TopPerformingChatbot {
    api_key: string;
    name: string;
    total_users: number;
    conversions: number;
    conversion_rate: number;
}

export interface AdminAnalytics {
    totalUsers: number;
    totalChatbots: number;
    totalConversations: number;
    totalCartActions: number;
    conversionRate: number;
    averageConversationsPerChatbot: number;
    averageMessagesPerChatbot: number;
    averageConversionRate: number;
    recentActivity: RecentActivity[];
    intentDistribution: IntentCount[];
    topQueries: QueryCount[];
    topChatbots: TopChatbot[];
    topPerformingChatbots: TopPerformingChatbot[];
    timeRange: number;
}

export interface ClientAnalytics {
    totalChatbots: number;
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversionRate: number;
    recentActivity: RecentActivity[];
    intentDistribution: IntentCount[];
    topQueries: QueryCount[];
    chatbotStats: ChatbotStat[];
    timeRange: number;
}