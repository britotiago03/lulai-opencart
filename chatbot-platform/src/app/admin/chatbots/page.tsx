// src/app/admin/chatbots/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import ChatbotSearchFilter from "@/components/admin-dashboard/chatbots/ChatbotSearchFilter";
import ErrorState from "@/components/admin-dashboard/chatbots/ErrorState";
import EmptyState from "@/components/admin-dashboard/chatbots/EmptyState";
import ChatbotTable from "@/components/admin-dashboard/chatbots/ChatbotTable";
import { Chatbot, ChatbotWithStats } from "@/types/chatbot";

export default function ChatbotsMonitoringPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<ChatbotWithStats[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // "all", "active", "inactive", "error"
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
                const enhancedChatbots: ChatbotWithStats[] = await Promise.all(
                    chatbotsData.map(async (chatbot: Chatbot) => {
                        // In a real scenario, you might make separate API calls to get these details
                        // or your API might already return them
                        try {
                            // Get user details
                            const userResponse = await fetch(`/api/users/${chatbot.user_id}`);
                            const userData = await userResponse.json();

                            // Get conversation stats
                            const statsResponse = await fetch(`/api/conversations/stats?chatbotId=${chatbot.id}`);
                            const statsData = await statsResponse.json();

                            // Return enhanced chatbot data
                            return {
                                ...chatbot,
                                userName: userData.name,
                                userEmail: userData.email,
                                status: statsData.status || "inactive",
                                conversationCount: statsData.count || 0,
                                lastActive: statsData.lastActive || chatbot.updated_at
                            };
                        } catch (err) {
                            // Fallback with default values if API calls fail
                            console.error(`Error fetching details for chatbot ${chatbot.id}:`, err);
                            return {
                                ...chatbot,
                                userName: "Unknown User",
                                userEmail: "unknown@example.com",
                                status: "inactive" as const,
                                conversationCount: 0,
                                lastActive: chatbot.updated_at
                            };
                        }
                    })
                );

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
    }, [session, status, router]);

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

    if (loading) {
        return <LoadingSkeleton />;
    }

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