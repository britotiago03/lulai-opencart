// src/app/admin-dashboard/conversations/thread/[threadId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import ErrorDisplay from "@/components/admin-dashboard/conversations/ErrorDisplay";
import EmptyConversation from "@/components/admin-dashboard/conversations/EmptyConversation";
import MessageList from "@/components/admin-dashboard/conversations/MessageList";
import ConversationSummary from "@/components/admin-dashboard/conversations/ConversationSummary";
import { Message, ChatbotInfo } from "@/types/conversation";

export default function AdminConversationThreadPage() {
    const { threadId } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatbotInfo, setChatbotInfo] = useState<ChatbotInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                    setError("Thread ID is required");
                    return;
                }

                // Split the threadId to get user_id and api_key
                const [userId, apiKey] = (threadId as string).split('-');

                if (!userId || !apiKey) {
                    setError("Invalid thread ID format");
                    return;
                }

                // Fetch all messages for this user and chatbot
                const response = await fetch(`/api/conversations?userId=${userId}&apiKey=${apiKey}`);

                if (!response.ok) {
                    setError("Failed to fetch conversation thread");
                    return;
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

        fetchConversationThread().catch(err => {
            console.error("Unhandled error in fetchConversationThread:", err);
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        });
    }, [threadId, session, status, router]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <BackLink />
                <ErrorDisplay error={error} />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <BackLink />
                <EmptyConversation />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <BackLink />

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

            <MessageList messages={messages} />

            <ConversationSummary messages={messages} chatbotInfo={chatbotInfo} />
        </div>
    );
}

function BackLink() {
    return (
        <Link href={`/admin/conversations`} className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Conversations
        </Link>
    );
}