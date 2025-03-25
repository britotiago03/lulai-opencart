"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    userId: string;
    created_at: string;
    updated_at: string;
    responses: any[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalChatbots: 0,
        totalConversations: 0,
        conversionRate: 0,
        averageResponseTime: 0,
    });

    // Fetch chatbots
    useEffect(() => {
        const fetchChatbots = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch("/api/chatbots");
                if (!response.ok) {
                    throw new Error("Failed to fetch chatbots");
                }

                const allChatbots = await response.json();
                const userChatbots = allChatbots.filter(
                    (chatbot: Chatbot) => chatbot.userId === user.id
                );

                setChatbots(userChatbots);

                if (userChatbots.length > 0) {
                    setStats({
                        totalChatbots: userChatbots.length,
                        totalConversations: 178,
                        conversionRate: 5.2,
                        averageResponseTime: 1.8,
                    });
                }
            } catch (err) {
                console.error("Error fetching chatbots:", err);
                setError("Failed to load your chatbots. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, [user]);

    // Loading
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <div className="mt-4">Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="text-center py-4">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Link
                                href="/dashboard/chatbots"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                View My Chatbots
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main Return
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/dashboard/chatbots"
                        className="px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors text-sm sm:text-base"
                    >
                        All Chatbots
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        Analytics
                    </Link>
                </div>
            </div>

            {/* Welcome Card */}
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between flex-wrap">
                        <Link href="/dashboard/integrations" className="flex items-center">
                            <div className="bg-blue-600/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold">
                                    Welcome back, {user?.name || "User"}
                                </h2>
                                <p className="text-gray-400 mt-1">
                                    Here's an overview of your chatbots and their performance
                                </p>
                            </div>
                        </Link>
                        {chatbots.length === 0 ? (
                            <Link
                                href="/dashboard/chatbots/create"
                                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Chatbot
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/chatbots/create"
                                className="mt-4 md:mt-0 px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors"
                            >
                                Create New Chatbot
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {/* Total Chatbots */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Chatbots</p>
                                <p className="text-2xl font-bold">{stats.totalChatbots}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Conversations */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Conversations</p>
                                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-purple-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversion Rate */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Conversion Rate</p>
                                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                            </div>
                            <div className="bg-green-600/20 p-3 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Response Time */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Avg. Response Time</p>
                                <p className="text-2xl font-bold">{stats.averageResponseTime}s</p>
                            </div>
                            <div className="bg-yellow-600/20 p-3 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-yellow-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chatbots Section */}
            {chatbots.length > 0 ? (
                <Card className="bg-[#1b2539] border-0 mt-6">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Your Chatbots</h3>
                            <Link
                                href="/dashboard/chatbots"
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                View All →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chatbots.slice(0, 3).map((chatbot) => (
                                <Link key={chatbot.id} href={`/dashboard/chatbots/${chatbot.id}`}>
                                    <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors cursor-pointer h-full">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-medium line-clamp-1">{chatbot.name}</div>
                                            <div className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                                                {chatbot.industry}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                            {chatbot.description || "No description"}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            {chatbot.responses?.length || 0} responses configured
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-[#1b2539] border-0 mt-6">
                    <CardContent className="p-6 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h3 className="text-xl font-medium mb-2">No Chatbots Yet</h3>
                        <p className="text-gray-400 mb-6">
                            Create your first chatbot to start engaging with your customers
                        </p>
                        <Link
                            href="/dashboard/chatbots/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Chatbot
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Recent Conversations Section */}
            {chatbots.length > 0 && (
                <Card className="bg-[#1b2539] border-0 mt-6">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Recent Conversations</h3>
                            <Link
                                href="/dashboard/conversations"
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                View All →
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors"
                                >
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center text-sm text-gray-400">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Today,{" "}
                                            {new Date().toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                        <div className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">
                                            Converted
                                        </div>
                                    </div>
                                    <p className="font-medium truncate">How do I track my order?</p>
                                    <p className="text-sm text-gray-400 truncate">
                                        I ordered a product yesterday and wanted to check on shipping status.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Subscription Info */}
            <Card className="bg-[#1b2539] border-0 mt-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Your Subscription</h3>
                            <p className="text-gray-400 mt-1">Professional Plan - $49.99/month</p>
                            <div className="mt-2 text-sm">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">
                  Active
                </span>
                                <span className="ml-2 text-gray-400">
                  Next billing:{" "}
                                    {new Date(
                                        Date.now() + 15 * 24 * 60 * 60 * 1000
                                    ).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button className="px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors mr-2">
                                Upgrade Plan
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Manage Billing
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
