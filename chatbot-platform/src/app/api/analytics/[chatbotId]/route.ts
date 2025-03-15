// src/app/api/analytics/[chatbotId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getChatbotAnalytics,
    getChatbotConversations,
    getChatbotFeedback
} from '@/lib/analytics/db';
import { ChatbotAnalytics, FeedbackSummary, ConversationSummary } from '@/lib/analytics/types';

// Define an interface for the response data
interface AnalyticsResponseData {
    analytics?: ChatbotAnalytics;
    conversations?: {
        conversations: ConversationSummary[];
        total: number;
    };
    feedback?: FeedbackSummary;
}

export async function GET(
    request: NextRequest,
    context: { params: { chatbotId: string } }
) {
    try {
        const params = await context.params;
        const chatbotId = params.chatbotId;
        const searchParams = request.nextUrl.searchParams;

        // Get date range from query params
        const startDate = searchParams.get('startDate') ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 30 days ago
        const endDate = searchParams.get('endDate') ||
            new Date().toISOString().split('T')[0]; // Default to today

        // Get metric type (if specified)
        const metricType = searchParams.get('metric') || 'all';

        const responseData: AnalyticsResponseData = {};

        // Fetch the requested metrics based on the metric type
        if (metricType === 'all' || metricType === 'overview') {
            const analytics = await getChatbotAnalytics(chatbotId, startDate, endDate);
            responseData.analytics = analytics;
        }

        if (metricType === 'all' || metricType === 'conversations') {
            const limit = parseInt(searchParams.get('limit') || '10', 10);
            const offset = parseInt(searchParams.get('offset') || '0', 10);
            const conversations = await getChatbotConversations(chatbotId, startDate, endDate, limit, offset);
            responseData.conversations = conversations;
        }

        if (metricType === 'all' || metricType === 'feedback') {
            const feedback = await getChatbotFeedback(chatbotId, startDate, endDate);
            responseData.feedback = feedback;
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching chatbot analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}