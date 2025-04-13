// src/app/dashboard/agents/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MessageSquare, Search, Activity, Settings, Bot } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    platform: string;
    api_key: string;
    product_api_url: string;
    created_at: string;
    updated_at: string;
}

export default function AgentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchChatbots = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/chatbots");
                if (!response.ok) {
                    throw new Error("Failed to fetch chatbots");
                }

                const data = await response.json();
                setChatbots(data);
            } catch (err) {
                console.error("Error fetching chatbots:", err);
                setError("Failed to load chatbots. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchChatbots();
        }
    }, [session, status, router]);

    // Filter chatbots based on search
    const filteredChatbots = search
        ? chatbots.filter(
            (bot) =>
                bot.name.toLowerCase().includes(search.toLowerCase()) ||
                bot.description.toLowerCase().includes(search.toLowerCase()) ||
                bot.industry.toLowerCase().includes(search.toLowerCase())
        )
        : chatbots;

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Your Agents</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <Link
                        href="/dashboard/integrations"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Agent
                    </Link>
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
            ) : filteredChatbots.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">
                            {search ? "No agents found matching your search" : "No agents yet"}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {search
                                ? "Try searching with different keywords"
                                : "Create your first chatbot agent to get started"}
                        </p>
                        {!search && (
                            <Link
                                href="/dashboard/integrations"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Agent
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredChatbots.map((chatbot) => (
                        <Card key={chatbot.id} className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-duration-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold">{chatbot.name}</h3>
                                    <div className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                                        {chatbot.industry}
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-4">
                                    {chatbot.description || `Chatbot agent for ${chatbot.platform}`}
                                </p>

                                <div className="mb-6 text-xs text-gray-500">
                                    Created on {new Date(chatbot.created_at).toLocaleDateString()}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href={`/dashboard/conversations?chatbotId=${chatbot.id}`}
                                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md transition-colors"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Conversations
                                    </Link>

                                    <Link
                                        href={`/dashboard/analytics?chatbotId=${chatbot.id}`}
                                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md transition-colors"
                                    >
                                        <Activity className="h-4 w-4 mr-2" />
                                        Analytics
                                    </Link>

                                    <Link
                                        href={`/dashboard/agents/${chatbot.id}/settings`}
                                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md transition-colors col-span-2"
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}