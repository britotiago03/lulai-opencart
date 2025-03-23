// src/components/analytics/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Filter } from 'lucide-react';
import ConversationRateChart from './ConversionRateChart';
import FeedbackSummary from './FeedbackSummary';
import StatisticsCard from './StatisticsCard';
import TopicsChart from './TopicsChart';
import UsageChart from './UsageChart';
import FilterBar from './FilterBar';
import { ChatbotAnalytics } from '@/lib/analytics/types';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsDashboardProps {
    chatbotId: string;
    startDate: string;
    endDate: string;
}

export default function AnalyticsDashboard({
                                               chatbotId,
                                               startDate,
                                               endDate,
                                           }: AnalyticsDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin } = useAuth();
    const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [ownedChatbots, setOwnedChatbots] = useState<{id: string, name: string}[]>([]);

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                // Check if user has access to this chatbot (if not admin)
                if (!isAdmin) {
                    const chatbotsResponse = await fetch('/api/chatbots');
                    const chatbotsData = await chatbotsResponse.json();

                    // Filter chatbots owned by current user
                    const userChatbots = chatbotsData.filter((chatbot: any) => chatbot.userId === user?.id);
                    setOwnedChatbots(userChatbots.map((c: any) => ({ id: c.id, name: c.name })));

                    // Check if the selected chatbot belongs to the user
                    const hasAccess = userChatbots.some((c: any) => c.id === chatbotId);

                    if (!hasAccess) {
                        // If user doesn't have access to this chatbot, redirect to first owned chatbot
                        // or show an error if they don't have any
                        if (userChatbots.length > 0) {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('chatbotId', userChatbots[0].id);
                            router.push(`/dashboard/analytics?${params.toString()}`);
                            return;
                        } else {
                            throw new Error('You do not have access to any chatbots');
                        }
                    }
                }

                // Fetch analytics data
                const response = await fetch(
                    `/api/analytics/${chatbotId}?startDate=${startDate}&endDate=${endDate}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const data = await response.json();
                setAnalytics(data.analytics);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (chatbotId) {
            fetchAnalytics();
        }
    }, [chatbotId, startDate, endDate, router, searchParams, user, isAdmin]);

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4">Loading analytics data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p>No analytics data available for the selected time period.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onDateChange={(newStartDate, newEndDate) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('startDate', newStartDate);
                    params.set('endDate', newEndDate);
                    router.push(`?${params.toString()}`);
                }}
            />

            {/* Selected Date Range Display */}
            <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticsCard
                    title="Total Conversations"
                    value={analytics.conversation_count || 0}
                    description="Total chat sessions"
                    trend={analytics.conversation_trend || 0}
                    icon={<MessageSquareIcon />}
                />
                <StatisticsCard
                    title="Messages"
                    value={analytics.message_count || 0}
                    description="Total messages exchanged"
                    trend={analytics.message_trend || 0}
                    icon={<MessagesIcon />}
                />
                <StatisticsCard
                    title="Average Response Time"
                    value={`${analytics.average_response_time ? analytics.average_response_time.toFixed(1) : '0.0'}s`}
                    description="Time to respond"
                    trend={analytics.response_time_trend ? -analytics.response_time_trend : 0} // Negative because lower is better
                    trendReversed
                    icon={<ClockIcon />}
                />
                <StatisticsCard
                    title="Conversion Rate"
                    value={`${analytics.conversion_rate || 0}%`}
                    description="Chats leading to sales"
                    trend={analytics.conversion_trend || 0}
                    icon={<ShoppingCartIcon />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardHeader>
                        <CardTitle>Conversation Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageChart data={analytics.daily_conversations || []} />
                    </CardContent>
                </Card>
                <Card className="bg-[#1b2539] border-0">
                    <CardHeader>
                        <CardTitle>Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ConversationRateChart data={analytics.conversion_data || []} />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardHeader>
                        <CardTitle>Popular Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopicsChart data={analytics.popular_topics || []} />
                    </CardContent>
                </Card>
                <Card className="bg-[#1b2539] border-0">
                    <CardHeader>
                        <CardTitle>User Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeedbackSummary data={analytics.feedback_summary || {
                            average_rating: 0,
                            total_ratings: 0,
                            ratings_distribution: []
                        }} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Icon components
function MessageSquareIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
        </svg>
    );
}

function MessagesIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function ShoppingCartIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    );
}