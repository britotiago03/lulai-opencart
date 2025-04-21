"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import MessageList from "@/components/dashboard/conversations/MessageList";
import ConversationStats from "@/components/dashboard/conversations/ConversationStats";
import HeaderBackLink from "@/components/dashboard/conversations/HeaderBackLink";

export interface Message {
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
    const { status } = useSession();
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
                const response = await fetch(`/api/conversations?conversationId=${id}`);
                if (!response.ok) {
                    console.error("Failed to fetch conversation");
                    setError("Failed to load conversation. Please try again.");
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                let messagesData = Array.isArray(data) ? data : [data];

                if (messagesData.length === 1) {
                    const { user_id, api_key } = messagesData[0];
                    const threadResponse = await fetch(`/api/conversations?userId=${user_id}&apiKey=${api_key}`);
                    if (threadResponse.ok) {
                        const threadData = await threadResponse.json();
                        if (Array.isArray(threadData) && threadData.length > 0) {
                            messagesData = threadData;
                        }
                    }
                }

                const sorted = messagesData.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                setMessages(sorted);
            } catch (err) {
                console.error("Error fetching conversation:", err);
                setError("Failed to load conversation. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated" && id) {
            void fetchConversation();
        }
    }, [id, status, router]);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <HeaderBackLink />

            {error ? (
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
            ) : messages.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-400 mb-4">No messages found for this conversation.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Conversation</h1>
                        <p className="text-gray-400 mt-1">
                            {new Date(messages[0].created_at).toLocaleString()}
                        </p>
                    </div>

                    <MessageList messages={messages} />
                    <ConversationStats messages={messages} />
                </>
            )}
        </div>
    );
}
