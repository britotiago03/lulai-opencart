// Reusable base type for any chart-compatible data item
export interface ChartDataItem {
    [key: string]: string | number | Date | null;
}

export interface IntentItem {
    intent: string;
    count: number;
}

// Daily stats (used in charts, now extends ChartDataItem)
export interface DailyItem extends ChartDataItem {
    date: string;
    count: number;
    messages: number;
}

export interface CartOpItem {
    operation: string;
    count: number;
}

export interface NavAction {
    target: string;
    count: number;
}

// New: Product item for top products analytics
export interface ProductItem {
    product_name: string;
    product_id?: string | number;
    count: number;
}

// New: Detailed cart operation with product info
export interface DetailedCartOpItem {
    operation: string;
    product_name: string;
    product_id?: string | number;
    count: number;
}

export interface ChatbotStat {
    name: string;
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    conversions: number;
    conversionRate: number;
    cartOperations?: CartOpItem[];
    navigationActions?: NavAction[];
    topProducts?: ProductItem[];
}

export interface AnalyticsData {
    totalConversations: number;
    totalMessages: number;
    averageResponseTime: number;
    conversionRate: number;
    conversions?: number;
    completedPurchases?: number;
    recentActivity?: DailyItem[];
    dailyStats?: DailyItem[];
    intentDistribution?: IntentItem[];
    topQueries?: { message_content: string; count: number }[];
    cartOperations?: CartOpItem[];
    navigationActions?: NavAction[];
    topProducts?: ProductItem[];
    detailedCartOperations?: DetailedCartOpItem[];
    chatbotStats?: ChatbotStat[];
    topPerformingChatbots?: ChatbotStat[];
    totalCartActions?: number;
    chatbotName?: string;
}
