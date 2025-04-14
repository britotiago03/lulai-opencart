// src/app/dashboard/conversations/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, Search } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Conversation {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
    chatbot_name?: string;
    threadId?: string;
    messageCount?: number;
    firstMessage?: any;
}

export default function ConversationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/conversations");
                if (!response.ok) {
                    throw new Error("Failed to fetch conversations");
                }

                const data = await response.json();

                // Group conversations by user_id and chatbot
                const groupedByUser = data.reduce((acc, convo) => {
                    const key = `${convo.user_id}-${convo.api_key}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(convo);
                    return acc;
                }, {});

                // Get the most recent message for each user-chatbot combination
                const latestMessages = Object.values(groupedByUser).map((convos: any[]) => {
                    // Sort by timestamp descending
                    const sorted = [...convos].sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );

                    // Return the most recent message with thread information
                    const latest = sorted[0];
                    return {
                        ...latest,
                        threadId: `${latest.user_id}-${latest.api_key}`,
                        messageCount: convos.length,
                        firstMessage: sorted[sorted.length - 1]
                    };
                });

                setConversations(latestMessages);
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError("Failed to load conversations. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchConversations();
        }
    }, [session, status, router]);

    // Filter conversations based on search
    const filteredConversations = search
        ? conversations.filter((convo) =>
            convo.message_content.toLowerCase().includes(search.toLowerCase())
        )
        : conversations;

    // Group conversations by date
    const groupedConversations = filteredConversations.reduce((groups, convo) => {
        const date = new Date(convo.created_at).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(convo);
        return groups;
    }, {} as Record<string, Conversation[]>);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Conversations</h1>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

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
            ) : filteredConversations.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Conversations Yet</h3>
                        <p className="text-gray-400 mb-6">
                            When your chatbot starts engaging with users, conversations will appear here
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedConversations).map(([date, convos]) => (
                        <div key={date}>
                            <div className="flex items-center mb-4">
                                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                <h2 className="text-lg font-medium text-gray-300">{date}</h2>
                            </div>

                            <div className="space-y-4">
                                {convos.map((convo) => (
                                    <Link
                                        key={convo.threadId || convo.id}
                                        href={`/dashboard/conversations/thread/${convo.threadId}`}
                                    >
                                        <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between mb-2">
                                                    <div className="flex items-center text-sm text-gray-400">
                                                        <MessageSquare className="h-4 w-4 mr-1" />
                                                        {new Date(convo.created_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                    <div className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">
                                                        {convo.messageCount} messages
                                                    </div>
                                                </div>
                                                <p className="font-medium truncate">{convo.message_content}</p>
                                                <p className="text-sm text-gray-400 mt-2">
                                                    User: {convo.user_id}
                                                    {convo.chatbot_name && ` • Via: ${convo.chatbot_name}`}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}