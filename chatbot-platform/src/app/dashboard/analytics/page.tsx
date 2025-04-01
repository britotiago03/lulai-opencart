// src/app/dashboard/analytics/page.tsx
"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { ChatbotAnalytics } from '@/lib/analytics/types';
import { SessionProvider, useSession } from 'next-auth/react';

function AnalyticsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
    const [chatbots, setChatbots] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get date range from query params or set defaults
    const startDate = searchParams.get('startDate') ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 30 days ago
    const endDate = searchParams.get('endDate') ||
        new Date().toISOString().split('T')[0]; // Default to today

    // Fetch available chatbots
    useEffect(() => {

        if (status === "unauthenticated") {
            router.push('/auth/signin');
            router.refresh();
            return;
        }

        const fetchChatbots = async () => {
            try {
                const response = await fetch('/api/chatbots');
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
                }
                const data = await response.json();
                setChatbots(data.map((bot: any) => ({ id: bot.id, name: bot.name })));

                // If a chatbot ID is in the query params, select it
                const chatbotIdParam = searchParams.get('chatbotId');
                if (chatbotIdParam && data.some((bot: any) => bot.id === chatbotIdParam)) {
                    setSelectedChatbotId(chatbotIdParam);
                } else if (data.length > 0) {
                    // Otherwise select the first chatbot
                    setSelectedChatbotId(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching chatbots:', error);
                setError('Failed to load chatbots. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, [searchParams, session, router]);

    // Handle chatbot selection change
    const handleChatbotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newChatbotId = e.target.value;
        setSelectedChatbotId(newChatbotId);

        // Update URL with the new chatbot ID
        const params = new URLSearchParams(searchParams.toString());
        params.set('chatbotId', newChatbotId);
        router.push(`?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">Loading analytics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error}</p>
                        <Link
                            href="/dashboard/chatbots"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Chatbots
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (chatbots.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>No Chatbots Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">You don't have any chatbots yet. Create your first chatbot to view analytics.</p>
                        <Link
                            href="/dashboard/chatbots/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create New Chatbot
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Chatbot Analytics</h1>
                <div className="flex gap-4 items-center">
                    <select
                        value={selectedChatbotId || ''}
                        onChange={handleChatbotChange}
                        className="p-2 border rounded-md bg-background text-foreground"
                    >
                        {chatbots.map((chatbot) => (
                            <option key={chatbot.id} value={chatbot.id}>
                                {chatbot.name}
                            </option>
                        ))}
                    </select>
                    <Link
                        href={`/dashboard/chatbots/${selectedChatbotId}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        View Chatbot
                    </Link>
                </div>
            </div>

            {selectedChatbotId && (
                <AnalyticsDashboard
                    chatbotId={selectedChatbotId}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <SessionProvider>
            <AnalyticsPageContent />
        </SessionProvider>
    );
}