/* src/app/dashboard/chatbots/[id]/conversations/page.tsx */
"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ConversationSummary } from '@/lib/analytics/types';
import { MessageCircle, CheckCircle, Calendar, Clock } from 'lucide-react';

export default function ConversationsPage({ params }: { params: { id: string } }) {
    const unwrappedParams = use(params); // even showing errors this method works instead
    const chatbotId = unwrappedParams.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;

    // Date filtering
    const startDate = searchParams.get('startDate') ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 30 days ago
    const endDate = searchParams.get('endDate') ||
        new Date().toISOString().split('T')[0]; // Default to today

    // Load conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const offset = (page - 1) * limit;

                const response = await fetch(
                    `/api/analytics/${chatbotId}?metric=conversations&startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch conversations');
                }

                const data = await response.json();
                setConversations(data.conversations.conversations);
                setTotalCount(data.conversations.total);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setError('Failed to load conversations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [chatbotId, page, startDate, endDate]);

    // Format date for display
    const formatDate = (date: Date | string) => {
        try {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return "Invalid date";
        }
    };

    // Format time for display
    const formatTime = (date: Date | string) => {
        try {
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error("Error formatting time:", e);
            return "Invalid time";
        }
    };

    // Handle pagination
    const totalPages = Math.ceil(totalCount / limit);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">Loading conversations...</div>
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
                            href={`/dashboard/chatbots/${chatbotId}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Chatbot
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Conversation History</h1>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/chatbots/${chatbotId}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Back to Chatbot
                    </Link>
                    <Link
                        href={`/dashboard/analytics?chatbotId=${chatbotId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        View Analytics
                    </Link>
                </div>
            </div>

            {/* Date filter (simplified version) */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm text-gray-500">From:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set('startDate', e.target.value);
                                    params.set('page', '1'); // Reset to first page
                                    router.push(`?${params.toString()}`);
                                }}
                                className="p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm text-gray-500">To:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set('endDate', e.target.value);
                                    params.set('page', '1'); // Reset to first page
                                    router.push(`?${params.toString()}`);
                                }}
                                className="p-2 border rounded-md"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conversations list */}
            {conversations.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No conversations found for this period.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            href={`/dashboard/chatbots/${chatbotId}/conversations/${conversation.id}`}
                        >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(conversation.startedAt)}
                                            <Clock className="w-4 h-4 ml-3 mr-1" />
                                            {formatTime(conversation.startedAt)}
                                        </div>
                                        {conversation.ledToConversion && (
                                            <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Converted {conversation.conversionValue && `($${conversation.conversionValue})`}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <p className="font-medium truncate">{conversation.firstMessage}</p>
                                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                                    </div>

                                    <div className="flex items-center mt-3 text-sm text-gray-500">
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}

                                        {conversation.sourceUrl && (
                                            <span className="ml-4 truncate max-w-xs">
                                                Source: {(() => {
                                                try {
                                                    return new URL(conversation.sourceUrl).pathname;
                                                } catch (e) {
                                                    return conversation.sourceUrl;
                                                }
                                            })()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                            &laquo; Prev
                        </button>

                        <div className="px-3 py-1 border rounded-md bg-gray-50">
                            Page {page} of {totalPages}
                        </div>

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                            Next &raquo;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}