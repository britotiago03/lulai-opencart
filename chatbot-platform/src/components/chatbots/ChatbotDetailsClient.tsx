// chatbot-platform/src/components/chatbots/ChatbotDetailsClient.tsx:
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chatbot } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ChatbotDetailsClient({ id }: { id: string }) {
    const [chatbot, setChatbot] = useState<Chatbot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatbot = async () => {
            try {
                const response = await fetch(`/api/chatbots/${id}`);
                if (response.status === 404) {
                    setError('Chatbot not found');
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbot details');
                }
                const data = await response.json();
                setChatbot(data);
            } catch (error) {
                setError('Error loading chatbot details');
                console.error('Error fetching chatbot:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatbot();
    }, [id]);

    if (loading) {
        return <div className="text-center py-8">Loading chatbot details...</div>;
    }

    if (error || !chatbot) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error || 'Could not load chatbot'}</p>
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">{chatbot.name}</h1>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/chatbots"
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Back
                    </Link>
                    <Link
                        href={`/dashboard/chatbots/${id}/test`}
                        className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                    >
                        Test Chatbot
                    </Link>
                    <Link
                        href={`/dashboard/chatbots/${chatbot.id}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Edit Chatbot
                    </Link>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Chatbot Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-500">Industry</h3>
                            <p className="capitalize">{chatbot.industry}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-500">API URL</h3>
                            <p>{chatbot.apiUrl}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-500">Platform</h3>
                            <p className="capitalize">{chatbot.platform}</p>
                        </div>
                        {chatbot.apiKey && (
                            <div>
                                <h3 className="font-medium text-gray-500">API Key</h3>
                                <p className="truncate">{chatbot.apiKey}</p>
                            </div>
                        )}
                        {chatbot.customPrompt && (
                            <div>
                                <h3 className="font-medium text-gray-500">Custom Prompt</h3>
                                <p>{chatbot.customPrompt}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-gray-500">Created</h3>
                            <p>{chatbot.createdAt ? new Date(chatbot.createdAt).toLocaleDateString() : 'Unknown'}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-500">Last Updated</h3>
                            <p>{chatbot.updatedAt ? new Date(chatbot.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
