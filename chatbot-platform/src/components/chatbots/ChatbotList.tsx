// chatbot-platform/src/components/chatbots/ChatbotList.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chatbot } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ChatbotList() {
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatbots = async () => {
            try {
                const response = await fetch('/api/chatbots');
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
                }
                const data = await response.json();
                setChatbots(data);
            } catch (error) {
                setError('Error loading chatbots');
                console.error('Error fetching chatbots:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading chatbots...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (chatbots.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Chatbots Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                        Create your first chatbot by clicking the Create New Chatbot button above.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
                <Link
                    href={`/dashboard/chatbots/${chatbot.id}`}
                    key={chatbot.id}
                    className="block transition-transform hover:scale-102"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>{chatbot.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">
                                    {chatbot.industry}
                                </span>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                Created: {chatbot.createdAt ? new Date(chatbot.createdAt).toLocaleDateString() : 'Unknown date'}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
