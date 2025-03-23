// src/components/chatbots/ChatbotList.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, MessageSquare, BarChart3, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    userId?: string; // Added userId field for filtering
    created_at: string;
    updated_at: string;
    responses: any[];
}

export default function ChatbotList() {
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        const fetchChatbots = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/chatbots');

                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
                }

                let data = await response.json();

                // If user is not admin, filter chatbots to only show their own
                if (!isAdmin && user) {
                    data = data.filter((chatbot: Chatbot) => chatbot.userId === user.id);
                }

                setChatbots(data);
            } catch (error) {
                console.error('Error fetching chatbots:', error);
                setError('Failed to load chatbots. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, [user, isAdmin]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this chatbot?')) {
            return;
        }

        try {
            const response = await fetch(`/api/chatbots/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete chatbot');
            }

            // Update state to remove the deleted chatbot
            setChatbots(chatbots.filter(chatbot => chatbot.id !== id));
        } catch (error) {
            console.error('Error deleting chatbot:', error);
            alert('Failed to delete chatbot');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4">Loading chatbots...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (chatbots.length === 0) {
        return (
            <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium mb-2">No Chatbots Yet</h3>
                <p className="text-gray-500 mb-6">
                    Create your first chatbot to get started
                </p>
                <Link
                    href="/dashboard/chatbots/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create New Chatbot
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
                <Card key={chatbot.id} className="bg-[#1b2539] border-0 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-medium">{chatbot.name}</h3>
                            <div className="flex space-x-2">
                                <Link href={`/dashboard/chatbots/${chatbot.id}/edit`}>
                                    <button className="p-1 rounded hover:bg-gray-700 transition-colors">
                                        <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
                                    </button>
                                </Link>
                                <button
                                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                                    onClick={() => handleDelete(chatbot.id)}
                                >
                                    <Trash2 className="h-5 w-5 text-gray-400 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-400 mb-6 line-clamp-2">
                            {chatbot.description || 'No description provided'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-gray-500">Industry</p>
                                <p className="font-medium">{chatbot.industry}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Responses</p>
                                <p className="font-medium">{chatbot.responses?.length || 0}</p>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <Link
                                href={`/dashboard/chatbots/${chatbot.id}`}
                                className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                                Details
                            </Link>
                            <Link
                                href={`/dashboard/chatbots/${chatbot.id}/test`}
                                className="flex-1 text-center px-3 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm"
                            >
                                Test
                            </Link>
                            <Link
                                href={`/dashboard/analytics?chatbotId=${chatbot.id}`}
                                className="px-3 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                            >
                                <BarChart3 className="h-5 w-5" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}