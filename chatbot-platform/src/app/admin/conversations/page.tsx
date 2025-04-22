// src/app/admin/conversations/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, Search, ChevronRight } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Conversation } from "@/types/conversation";

export default function AdminConversationsPage() {
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

        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/admin/conversations");
                if (!response.ok) {
                    setError("Failed to fetch conversations");
                    return;
                }

                const data = await response.json();
                setConversations(data);
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError("Failed to load conversations. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        void fetchConversations();
    }, [session, status, router]);

    // Filter conversations based on search
    const filteredConversations = search
        ? conversations.filter((convo) =>
            convo.message_content.toLowerCase().includes(search.toLowerCase()) ||
            convo.chatbot_name?.toLowerCase().includes(search.toLowerCase()) ||
            convo.user_id.toLowerCase().includes(search.toLowerCase())
        )
        : conversations;

    // Group conversations by date
    const groupedConversations: Record<string, Conversation[]> = filteredConversations.reduce((groups, convo) => {
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
                <h1 className="text-2xl font-bold">All Platform Conversations</h1>

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
                        <h3 className="text-xl font-medium mb-2">No Conversations Found</h3>
                        <p className="text-gray-400 mb-6">
                            {search ? "Try adjusting your search criteria" : "No conversations have been logged yet"}
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
                                {convos.map((convo: Conversation) => (
                                    <Link key={convo.id} href={`/admin/conversations/thread/${convo.user_id}-${convo.api_key}`}>
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
                                                    <div className="flex items-center">
                                                        <div className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full mr-2">
                                                            {convo.message_role}
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                </div>
                                                <p className="font-medium truncate">{convo.message_content}</p>
                                                <div className="flex justify-between mt-2 text-sm text-gray-400">
                                                    <p>User: {convo.user_id}</p>
                                                    {convo.chatbot_name && (
                                                        <p>Chatbot: {convo.chatbot_name}</p>
                                                    )}
                                                </div>
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