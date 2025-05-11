// src/app/admin/chatbots/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import ChatbotSearchFilter from "@/components/admin-dashboard/chatbots/ChatbotSearchFilter";
import ErrorState from "@/components/admin-dashboard/chatbots/ErrorState";
import EmptyState from "@/components/admin-dashboard/chatbots/EmptyState";
import ChatbotTable from "@/components/admin-dashboard/chatbots/ChatbotTable";
import { Chatbot, ChatbotWithStats } from "@/types/chatbot";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function ChatbotsMonitoringPage() {
    // Use admin auth hook instead of regular session
    const { isLoading, isAdmin } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<ChatbotWithStats[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // "all", "active", "inactive", "error"
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch chatbots after confirming admin status
        if (!isLoading && isAdmin) {
            const fetchChatbots = async () => {
                try {
                    setLoading(true);
                    // Fetch chatbots
                    const response = await fetch('/api/admin/chatbots');

                    if (!response.ok) {
                        setError('Failed to fetch chatbots');
                        return;
                    }

                    const chatbotsData = await response.json();

                    // Fetch additional user and stats data to combine with the chatbots
                    // This step would be replaced with your actual API call that returns the enhanced data
                    // We'll use chatbotsData directly since it now contains all the information we need
                    const enhancedChatbots: ChatbotWithStats[] = chatbotsData.map((chatbot: any) => {
                        return {
                            ...chatbot,
                            userName: chatbot.userName || "Unknown User",
                            userEmail: chatbot.userEmail || "unknown@example.com",
                            status: chatbot.status || "inactive",
                            conversationCount: parseInt(chatbot.conversationCount) || 0,
                            lastActive: chatbot.lastActive || chatbot.updated_at,
                            api_key: chatbot.api_key || "" // Ensure API key is available
                        };
                    });

                    setChatbots(enhancedChatbots);
                } catch (err) {
                    console.error("Error fetching chatbots:", err);
                    setError("Failed to load chatbots. Please try again.");
                } finally {
                    setLoading(false);
                }
            };

            fetchChatbots().catch(err => {
                console.error("Unhandled error in fetchChatbots:", err);
                setError("An unexpected error occurred. Please try again.");
                setLoading(false);
            });
        }
    }, [isLoading, isAdmin]);

    // Show loading while admin auth is being checked
    if (isLoading || loading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null; // The hook will handle redirection
    }

    // Filter chatbots based on search and status filter
    const filteredChatbots = chatbots.filter(chatbot => {
        const matchesSearch = search === "" ||
            chatbot.name.toLowerCase().includes(search.toLowerCase()) ||
            chatbot.userName.toLowerCase().includes(search.toLowerCase()) ||
            chatbot.userEmail.toLowerCase().includes(search.toLowerCase()) ||
            chatbot.industry.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === "all" || chatbot.status === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Chatbot Monitoring</h1>
                <ChatbotSearchFilter
                    search={search}
                    setSearch={setSearch}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {error ? (
                <ErrorState error={error} />
            ) : filteredChatbots.length === 0 ? (
                <EmptyState />
            ) : (
                <Card className="bg-[#1b2539] border-0">
                    <ChatbotTable chatbots={filteredChatbots} />
                </Card>
            )}
        </div>
    );
}