// src/components/analytics/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChatbotAnalytics, ConversationSummary, FeedbackSummary } from '@/lib/analytics/types';
import StatisticsCard from './StatisticsCard';
import UsageChart from './UsageChart';
import ConversionRateChart from './ConversionRateChart';
import TopicsChart from './TopicsChart';
import ConversationsList from './ConversationsList';
import FeedbackSummaryComponent from './FeedbackSummary';
import FilterBar from './FilterBar';

interface AnalyticsDashboardProps {
    chatbotId: string;
    startDate: string;
    endDate: string;
}

export default function AnalyticsDashboard({
                                               chatbotId,
                                               startDate,
                                               endDate
                                           }: AnalyticsDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
    const [conversations, setConversations] = useState<{
        conversations: ConversationSummary[];
        total: number;
    } | null>(null);
    const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
    const [dateRange, setDateRange] = useState({ startDate, endDate });

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                // Fetch all data in one request
                const response = await fetch(
                    `/api/analytics/${chatbotId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API error details:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch analytics data');
                }

                const data = await response.json();

                setAnalytics(data.analytics);
                setConversations(data.conversations);
                setFeedback(data.feedback);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load analytics data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [chatbotId, dateRange.startDate, dateRange.endDate]);

    // Handle date range filter change
    const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
        setDateRange({
            startDate: newStartDate,
            endDate: newEndDate
        });
    };

    if (loading) {
        return <div className="text-center py-8">Loading analytics data...</div>;
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    // Check if analytics data exists
    if (!analytics) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Analytics Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There is no analytics data available for this chatbot yet. Start testing your chatbot to generate analytics.</p>
                    <Link
                        href={`/dashboard/chatbots/${chatbotId}/test`}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                    >
                        Test Chatbot
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <FilterBar
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateRangeChange={handleDateRangeChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticsCard
                    title="Total Conversations"
                    value={analytics.overview.totalConversations}
                    icon="message-circle"
                    trend={10} // Example trend value
                    trendLabel="vs. previous period"
                />

                <StatisticsCard
                    title="Conversation Rate"
                    value={`${typeof analytics.overview.conversionRate === 'number'
                        ? analytics.overview.conversionRate.toFixed(2)
                        : '0.00'}%`}
                    icon="shopping-cart"
                    trend={5}
                    trendLabel="vs. previous period"
                />

                <StatisticsCard
                    title="Avg. Feedback Score"
                    value={typeof analytics.overview.avgFeedbackScore === 'number'
                        ? analytics.overview.avgFeedbackScore.toFixed(1)
                        : '0.0'}
                    icon="star"
                    trend={0}
                    trendLabel="vs. previous period"
                    maxValue={5}
                />

                <StatisticsCard
                    title="AI Fallback Rate"
                    value={`${typeof analytics.overview.aiFallbacks === 'number' &&
                    typeof analytics.overview.totalMessages === 'number' &&
                    analytics.overview.totalMessages > 0
                        ? ((analytics.overview.aiFallbacks / analytics.overview.totalMessages) * 100).toFixed(2)
                        : '0.00'}%`}
                    icon="zap"
                    trend={-2}
                    trendLabel="vs. previous period"
                    invertTrend
                />

                <p className="text-2xl font-semibold">
                    {typeof analytics.overview.avgResponseTime === 'number'
                        ? analytics.overview.avgResponseTime.toFixed(2)
                        : '0.00'}s
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Conversations & Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageChart data={analytics.dailyMetrics} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ConversionRateChart data={analytics.dailyMetrics} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Popular Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopicsChart topics={analytics.popularTopics} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Chatbot Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Successful Matches</p>
                                    <p className="text-2xl font-semibold">{analytics.overview.successfulMatches}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">AI Fallbacks</p>
                                    <p className="text-2xl font-semibold">{analytics.overview.aiFallbacks}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Conversation Length</p>
                                    <p className="text-2xl font-semibold">
                                        {typeof analytics.overview.avgConversationLength === 'number'
                                            ? analytics.overview.avgConversationLength.toFixed(1)
                                            : '0.0'} messages
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                                    <p className="text-2xl font-semibold">{analytics.overview.avgResponseTime.toFixed(2)}s</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {conversations && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ConversationsList
                            conversations={conversations.conversations}
                            totalCount={conversations.total}
                            chatbotId={chatbotId}
                        />
                    </CardContent>
                </Card>
            )}

            {feedback && (
                <Card>
                    <CardHeader>
                        <CardTitle>User Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeedbackSummaryComponent feedback={feedback} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}