// src/app/admin/conversations/thread/[threadId]/page.tsx:
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, User, Bot, Clock, Info } from "lucide-react";
import Link from "next/link";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Message {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
    metadata?: any;
}

export default function AdminConversationThreadPage() {
    const { threadId } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatbotInfo, setChatbotInfo] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [showMetadata, setShowMetadata] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchConversationThread = async () => {
            try {
                setLoading(true);

                if (!threadId) {
                    throw new Error("Thread ID is required");
                }

                // Split the threadId to get user_id and api_key
                const [userId, apiKey] = (threadId as string).split('-');

                if (!userId || !apiKey) {
                    throw new Error("Invalid thread ID format");
                }

                // Fetch all messages for this user and chatbot
                const response = await fetch(`/api/conversations?userId=${userId}&apiKey=${apiKey}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch conversation thread");
                }

                const data = await response.json();

                // Sort messages by timestamp
                const sortedMessages = Array.isArray(data)
                    ? data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    : [];

                setMessages(sortedMessages);

                // Fetch chatbot information
                try {
                    const chatbotResponse = await fetch(`/api/chatbots?apiKey=${apiKey}`);
                    if (chatbotResponse.ok) {
                        const chatbotData = await chatbotResponse.json();
                        if (chatbotData && chatbotData.length > 0) {
                            setChatbotInfo(chatbotData[0]);
                        }
                    }
                } catch (chatbotError) {
                    console.error("Error fetching chatbot info:", chatbotError);
                }
            } catch (err) {
                console.error("Error fetching conversation thread:", err);
                setError("Failed to load conversation thread. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchConversationThread();
    }, [threadId, session, status, router]);

    const toggleMetadata = (id: string) => {
        setShowMetadata(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Link href="/admin/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
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
                <Link href="/admin/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
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
            <Link href="/admin/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Conversations
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Conversation Thread</h1>
                <div className="flex flex-col sm:flex-row sm:items-center mt-2 gap-2">
                    <p className="text-gray-400">
                        User ID: <span className="text-blue-400">{messages[0]?.user_id}</span>
                    </p>
                    {chatbotInfo && (
                        <>
                            <span className="hidden sm:inline text-gray-600 mx-2">•</span>
                            <p className="text-gray-400">
                                Chatbot: <Link href={`/admin/chatbots?id=${chatbotInfo.id}`} className="text-blue-400 hover:underline">{chatbotInfo.name}</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-6 mb-6">
                {messages.map((message, index) => (
                    <div key={index}>
                        <div className={`flex ${message.message_role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

                                <div className={`relative p-4 rounded-lg ${
                                    message.message_role === 'user' ? 'bg-blue-900/20 text-white' : 'bg-[#232b3c] text-white'
                                }`}>
                                    <div className="text-sm text-gray-400 flex items-center mb-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(message.created_at).toLocaleString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div>{message.message_content}</div>

                                    {message.metadata && (
                                        <button
                                            onClick={() => toggleMetadata(message.id)}
                                            className={`absolute -bottom-6 right-0 text-xs flex items-center ${
                                                showMetadata[message.id] ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            <Info className="h-3 w-3 mr-1" />
                                            {showMetadata[message.id] ? 'Hide metadata' : 'Show metadata'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {message.metadata && showMetadata[message.id] && (
                            <div className="mx-14 mt-8 mb-4 p-3 bg-gray-800/50 rounded border border-gray-700 text-xs font-mono overflow-x-auto">
                <pre className="text-gray-300">
                  {JSON.stringify(message.metadata, null, 2)}
                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Conversation Summary</h3>
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

                    {chatbotInfo && (
                        <div className="mt-4 p-4 bg-[#232b3c] rounded-md">
                            <h4 className="font-medium mb-2">Chatbot Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-400">Name: </span>
                                    <span>{chatbotInfo.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">API Key: </span>
                                    <span className="font-mono text-xs">{chatbotInfo.api_key}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Platform: </span>
                                    <span>{chatbotInfo.platform}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Industry: </span>
                                    <span>{chatbotInfo.industry}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-gray-400">Created: </span>
                                    <span>{new Date(chatbotInfo.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}