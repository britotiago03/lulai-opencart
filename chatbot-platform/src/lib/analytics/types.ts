// src/lib/analytics/types.ts
// Analytics overview data
export interface AnalyticsOverview {
    totalConversations: number;
    totalMessages: number;
    uniqueVisitors: number;
    avgConversationLength: number;
    avgResponseTime: number; // in seconds
    successfulMatches: number;
    aiFallbacks: number;
    avgFeedbackScore: number;
    conversionCount: number;
    conversionRate: number; // percentage
    totalConversionValue: number;
}

// Daily metrics for time-series charts
export interface DailyMetric {
    date: string;
    conversationCount: number;
    messageCount: number;
    conversionCount: number;
    conversionRate: number; // percentage
}

// Popular topic/trigger
export interface PopularTopic {
    trigger: string;
    count: number;
}

// Complete analytics data
export interface ChatbotAnalytics {
    overview: AnalyticsOverview;
    dailyMetrics: DailyMetric[];
    popularTopics: PopularTopic[];
}

// Conversation summary data
export interface ConversationSummary {
    id: string;
    sessionId: string;
    startedAt: Date | string;
    endedAt: Date | string | null;
    sourceUrl: string | null;
    messageCount: number;
    firstMessage: string;
    lastMessage: string;
    ledToConversion: boolean;
    conversionValue: number | null;
}

// Detailed conversation data with messages
export interface ConversationDetail {
    id: string;
    chatbotId: string;
    sessionId: string;
    startedAt: Date | string;
    endedAt: Date | string | null;
    sourceUrl: string | null;
    visitorId: string | null;
    platform: string | null;
    messageCount: number;
    firstMessage: string;
    lastMessage: string;
    ledToConversion: boolean;
    conversionValue: number | null;
    conversionAt: Date | string | null;
    messages: ConversationMessage[];
    feedback: {
        id: string;
        messageId: string;
        rating: number;
        feedbackText: string | null;
        submittedAt: Date | string;
    }[];
}

// Individual message in a conversation
export interface ConversationMessage {
    id: string;
    isFromUser: boolean;
    messageText: string;
    isAiGenerated: boolean;
    matchedTriggers: string[] | null;
    confidenceScore: number | null;
    sentAt: Date;
}

// Individual feedback entry
export interface ConversationFeedback {
    id: string;
    messageId: string;
    rating: number; // 1-5
    feedbackText: string | null;
    submittedAt: Date;
    messageText: string; // The message the feedback is about
    responseText: string; // The response the feedback is about
}

// Feedback summary
export interface FeedbackSummary {
    totalFeedback: number;
    averageRating: number; // 1-5
    ratingDistribution: Record<string, number>; // e.g. {'1': 5, '2': 10, ...}
    recentFeedback: ConversationFeedback[];
}
