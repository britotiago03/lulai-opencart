"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import GroupedConversations from "@/components/dashboard/conversations/GroupedConversations";
import SearchBar from "@/components/dashboard/conversations/SearchBar";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
    const { conversations, loading, error } = useConversations();
    const [search, setSearch] = useState("");

    const filtered = search
        ? conversations.filter((c) => c.message_content.toLowerCase().includes(search.toLowerCase()))
        : conversations;

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Conversations</h1>
                <SearchBar search={search} onChange={setSearch} />
            </div>

            {error ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Conversations Yet</h3>
                        <p className="text-gray-400 mb-6">
                            When your chatbot starts engaging with users, conversations will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <GroupedConversations conversations={filtered} />
            )}
        </div>
    );
}
