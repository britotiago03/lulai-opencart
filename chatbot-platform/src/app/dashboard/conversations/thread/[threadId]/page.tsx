"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Message } from "@/types/chat";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import HeaderBackLink from "@/components/dashboard/conversations/HeaderBackLink";
import ThreadHeader from "@/components/dashboard/conversations/ThreadHeader";
import MessageList from "@/components/dashboard/conversations/MessageList";
import ConversationStats from "@/components/dashboard/conversations/ConversationStats";

export default function ConversationThreadPage() {
    const { threadId } = useParams();
    const router = useRouter();
    const { status } = useSession();

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatbotInfo, setChatbotInfo] = useState<{ name: string; id: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchThread = async () => {
            try {
                setLoading(true);
                if (!threadId) {
                    setError("Thread ID is required.");
                    setLoading(false);
                    return;
                }

                const [userId, apiKey] = (threadId as string).split("-");
                if (!userId || !apiKey) {
                    setError("Invalid thread ID format.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`/api/conversations?userId=${userId}&apiKey=${apiKey}`);
                if (!res.ok) {
                    setError("Failed to fetch conversation thread.");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                const sorted = Array.isArray(data)
                    ? data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    : [];

                setMessages(sorted);

                const botRes = await fetch(`/api/chatbots?apiKey=${apiKey}`);
                if (botRes.ok) {
                    const bots = await botRes.json();
                    if (bots?.length > 0) {
                        setChatbotInfo({ name: bots[0].name, id: bots[0].id });
                    }
                }
            } catch (err) {
                console.error("Thread error:", err);
                setError("Failed to load conversation thread. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated" && threadId) {
            void fetchThread();
        }
    }, [threadId, status, router]);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <HeaderBackLink />

            {error ? (
                <ErrorCard message={error} />
            ) : messages.length === 0 ? (
                <EmptyCard />
            ) : (
                <>
                    <ThreadHeader userId={messages[0].user_id} chatbot={chatbotInfo} />
                    <MessageList messages={messages} />
                    <ConversationStats messages={messages} />
                </>
            )}
        </div>
    );
}

function ErrorCard({ message }: { message: string }) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <p className="text-red-400 mb-4">{message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Try Again
                </button>
            </CardContent>
        </Card>
    );
}

function EmptyCard() {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <p className="text-gray-400 mb-4">No messages found for this conversation.</p>
            </CardContent>
        </Card>
    );
}
