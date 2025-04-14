// src/app/admin/chatbots/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Bot, Filter, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface ChatbotData {
    id: string;
    name: string;
    userId: string;
    userName: string;
    userEmail: string;
    industry: string;
    platform: string;
    created_at: string;
    status: "active" | "inactive" | "error";
    conversationCount: number;
    lastActive: string;
}

export default function ChatbotsMonitoringPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<ChatbotData[]>([]);
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
                const response = await fetch('/api/admin/chatbots');

                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
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

        fetchChatbots();
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <span className="flex items-center px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">
          <CheckCircle className="h-3 w-3 mr-1" /> Active
        </span>;
            case "inactive":
                return <span className="flex items-center px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
          Inactive
        </span>;
            case "error":
                return <span className="flex items-center px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
          <AlertTriangle className="h-3 w-3 mr-1" /> Error
        </span>;
            default:
                return <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
          Unknown
        </span>;
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Chatbot Monitoring</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chatbots..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full sm:w-32 appearance-none pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="error">Error</option>
                        </select>
                        <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
            ) : filteredChatbots.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">
                            No chatbots found
                        </h3>
                        <p className="text-gray-400">
                            Try adjusting your search or filter criteria
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-[#1b2539] border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-3 px-4 text-left">Chatbot</th>
                                <th className="py-3 px-4 text-left">Owner</th>
                                <th className="py-3 px-4 text-left">Industry</th>
                                <th className="py-3 px-4 text-left">Platform</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Conversations</th>
                                <th className="py-3 px-4 text-left">Last Active</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredChatbots.map((chatbot) => (
                                <tr key={chatbot.id} className="border-b border-gray-800 hover:bg-[#232b3c] transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            {chatbot.name}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium">{chatbot.userName}</div>
                                            <div className="text-sm text-gray-400">{chatbot.userEmail}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                        {chatbot.industry}
                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">{chatbot.platform}</td>
                                    <td className="py-3 px-4">
                                        {getStatusBadge(chatbot.status)}
                                    </td>
                                    <td className="py-3 px-4">{chatbot.conversationCount}</td>
                                    <td className="py-3 px-4 text-gray-300">
                                        {new Date(chatbot.lastActive).toLocaleString(undefined, {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 text-blue-500 hover:text-blue-400 transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}