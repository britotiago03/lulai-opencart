"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Search, ArrowLeft } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminConversations } from "@/hooks/useAdminConversations";
import AdminGroupedConversations from "@/components/admin-dashboard/conversations/AdminGroupedConversations";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminConversationsPage() {
    // Use admin auth hook instead of regular session
    const { isLoading, isAdmin } = useAdminAuth();
    const { conversations, loading: conversationsLoading, error } = useAdminConversations();
    const [search, setSearch] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const apiKeyFilter = searchParams.get('filter');
    const [chatbotName, setChatbotName] = useState<string | null>(null);

    // Get chatbot name if we're filtering by API key
    useEffect(() => {
        if (apiKeyFilter) {
            fetch(`/api/admin/chatbots`)
                .then(res => res.json())
                .then(chatbots => {
                    const matchingChatbot = chatbots.find((c: any) => c.api_key === apiKeyFilter);
                    if (matchingChatbot) {
                        setChatbotName(matchingChatbot.name);
                    }
                })
                .catch(err => console.error("Error fetching chatbot name:", err));
        }
    }, [apiKeyFilter]);

    // Filter conversations based on search and API key
    const filteredConversations = conversations
        .filter(convo => {
            // First filter by API key if it's provided
            if (apiKeyFilter && apiKeyFilter !== "undefined" && convo.api_key !== apiKeyFilter) {
                return false;
            }
            
            // Then filter by search term if provided
            if (search) {
                return convo.message_content.toLowerCase().includes(search.toLowerCase()) ||
                    convo.chatbot_name?.toLowerCase().includes(search.toLowerCase()) ||
                    convo.user_id.toLowerCase().includes(search.toLowerCase());
            }
            
            return true;
        });

    // Show loading while admin auth is being checked
    if (isLoading || conversationsLoading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null; // The hook will handle redirection
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col gap-4 mb-6">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        {apiKeyFilter && apiKeyFilter !== "undefined" && (
                            <div className="flex items-center mb-2">
                                <Link href="/admin/conversations" className="flex items-center text-blue-500 hover:text-blue-400 mr-2">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to all conversations
                                </Link>
                            </div>
                        )}
                        
                        <h1 className="text-2xl font-bold">
                            {apiKeyFilter && apiKeyFilter !== "undefined"
                                ? `Conversations for ${chatbotName || 'Chatbot'}`
                                : 'All Platform Conversations'}
                        </h1>
                        
                        {apiKeyFilter && apiKeyFilter !== "undefined" ? (
                            <p className="text-sm text-gray-400 mt-1">
                                Showing {filteredConversations.length} conversations for this chatbot
                            </p>
                        ) : apiKeyFilter === "undefined" ? (
                            <p className="text-sm text-red-400 mt-1">
                                Error: Invalid chatbot filter. Showing all conversations instead.
                            </p>
                        ) : null}
                    </div>

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
                <AdminGroupedConversations conversations={filteredConversations} />
            )}
        </div>
    );
}