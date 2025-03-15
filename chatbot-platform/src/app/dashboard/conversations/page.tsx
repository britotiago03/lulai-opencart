// src/app/dashboard/conversations/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MessageCircle } from 'lucide-react';

export default function ConversationsPage() {
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<any[]>([]);
    const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on a mobile device
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Initial check
        checkIfMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIfMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Fetch available chatbots
    useEffect(() => {
        const fetchChatbots = async () => {
            try {
                const response = await fetch('/api/chatbots');
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
                }
                const data = await response.json();
                setChatbots(data);

                // If we have chatbots, select the first one by default
                if (data.length > 0) {
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
    }, []);

    // Fetch conversations for selected chatbot
    useEffect(() => {
        if (!selectedChatbotId) return;

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const endDate = new Date().toISOString().split('T')[0];

                const response = await fetch(
                    `/api/analytics/${selectedChatbotId}?metric=conversations&startDate=${startDate}&endDate=${endDate}&limit=10&offset=0`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch conversations');
                }

                const data = await response.json();
                setConversations(data.conversations?.conversations || []);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setError('Failed to load conversations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [selectedChatbotId]);

    // Handle chatbot selection change
    const handleChatbotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChatbotId(e.target.value);
    };

    // Format date for display
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="text-center py-8 text-white">Loading conversations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <Card className="bg-[#1b2539] text-white border-0">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Error</h2>
                        <p className="text-red-400 mb-4">{error}</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (chatbots.length === 0) {
        return (
            <div className="p-4 sm:p-6">
                <Card className="bg-[#1b2539] text-white border-0">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">No Chatbots Available</h2>
                        <p className="mb-4">You don't have any chatbots yet. Create a chatbot to view conversations.</p>
                        <Link
                            href="/dashboard/chatbots/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create New Chatbot
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">All Conversations</h1>
                <div>
                    <select
                        value={selectedChatbotId || ''}
                        onChange={handleChatbotChange}
                        className="p-2 border rounded-md bg-[#232b3c] text-white border-gray-700"
                    >
                        {chatbots.map((chatbot) => (
                            <option key={chatbot.id} value={chatbot.id}>
                                {chatbot.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {conversations.length > 0 ? (
                <div className="space-y-4">
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            href={`/dashboard/chatbots/${selectedChatbotId}/conversations/${conversation.id}`}
                        >
                            <Card className="bg-[#1b2539] text-white border-0 hover:bg-[#232b3c] transition-colors cursor-pointer">
                                <div className="p-4">
                                    <div className="flex justify-between mb-2 flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-gray-400 flex-wrap gap-2">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(conversation.startedAt)}
                                            <Clock className="w-4 h-4 ml-2 mr-1" />
                                            {new Date(conversation.startedAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        {conversation.ledToConversion && (
                                            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                        Converted {conversation.conversionValue && `($${conversation.conversionValue})`}
                      </span>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <p className="font-medium truncate">{conversation.firstMessage}</p>
                                        <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                                    </div>

                                    <div className="flex items-center mt-3 text-sm text-gray-400">
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}

                    <div className="flex justify-center mt-4">
                        <Link
                            href={`/dashboard/chatbots/${selectedChatbotId}/conversations`}
                            className="text-blue-400 hover:underline"
                        >
                            View all conversations →
                        </Link>
                    </div>
                </div>
            ) : (
                <Card className="bg-[#1b2539] text-white border-0">
                    <div className="p-6 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400">No conversations yet for this chatbot.</p>
                        <Link
                            href={`/dashboard/chatbots/${selectedChatbotId}/test`}
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Test Your Chatbot
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}