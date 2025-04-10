// src/app/dashboard/conversations/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, User, Bot, Clock } from "lucide-react";
import Link from "next/link";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Message {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
}

export default function ConversationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchConversation = async () => {
            try {
                setLoading(true);

                // Important: We're now looking for all messages in this conversation thread
                const response = await fetch(`/api/conversations?conversationId=${id}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch conversation");
                }

                const data = await response.json();

                // Check if we have an array of messages or a single message object
                let messagesData = Array.isArray(data) ? data : [data];

                // If it's a single message, try to fetch the whole conversation thread
                if (messagesData.length === 1) {
                    const userId = messagesData[0].user_id;
                    const apiKey = messagesData[0].api_key;

                    // Try to fetch all messages between this user and chatbot
                    const threadResponse = await fetch(`/api/conversations?userId=${userId}&apiKey=${apiKey}`);
                    if (threadResponse.ok) {
                        const threadData = await threadResponse.json();
                        if (Array.isArray(threadData) && threadData.length > 0) {
                            messagesData = threadData;
                        }
                    }
                }

                // Sort messages by timestamp
                const sortedMessages = messagesData.sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                setMessages(sortedMessages);
            } catch (err) {
                console.error("Error fetching conversation:", err);
                setError("Failed to load conversation. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated" && id) {
            fetchConversation();
        }
    }, [id, session, status, router]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Link href="/dashboard/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to Conversations
                </Link>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Link href="/dashboard/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to Conversations
                </Link>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-400 mb-4">No messages found for this conversation.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link href="/dashboard/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Conversations
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Conversation</h1>
                <p className="text-gray-400 mt-1">
                    {new Date(messages[0]?.created_at || Date.now()).toLocaleString()}
                </p>
            </div>

            <div className="space-y-4 mb-6">
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.message_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] flex ${message.message_role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.message_role === 'user' ? 'bg-blue-600 ml-3' : 'bg-purple-600 mr-3'
                            }`}>
                                {message.message_role === 'user' ? (
                                    <User className="h-5 w-5" />
                                ) : (
                                    <Bot className="h-5 w-5" />
                                )}
                            </div>

                            <div className={`p-4 rounded-lg ${
                                message.message_role === 'user' ? 'bg-blue-900/20 text-white' : 'bg-[#232b3c] text-white'
                            }`}>
                                <div className="text-sm text-gray-400 flex items-center mb-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(message.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div>{message.message_content}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Conversation Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">Total Messages</p>
                            <p className="text-xl font-semibold">{messages.length}</p>
                        </div>
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">User Messages</p>
                            <p className="text-xl font-semibold">
                                {messages.filter(m => m.message_role === 'user').length}
                            </p>
                        </div>
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">Bot Messages</p>
                            <p className="text-xl font-semibold">
                                {messages.filter(m => m.message_role === 'assistant').length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}