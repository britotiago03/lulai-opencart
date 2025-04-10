// src/app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart2,
    Users,
    MessageSquare,
    TrendingUp,
    Filter,
    RefreshCw,
    Calendar
} from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import dynamic from 'next/dynamic';

// Dynamically import chart components
const DynamicBarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const DynamicPieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const DynamicLineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });

export default function AdminAnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("30"); // "7", "30", "90"

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/analytics?timeRange=${timeRange}`);

                if (!response.ok) {
                    throw new Error(`Error fetching analytics: ${response.status}`);
                }

                const data = await response.json();
                setAnalyticsData(data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError("Failed to load analytics data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange, session, status, router]);

    const refreshData = () => {
        setLoading(true);
        fetch(`/api/analytics?timeRange=${timeRange}`)
            .then(res => res.json())
            .then(data => {
                setAnalyticsData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error refreshing data:", err);
                setError("Failed to refresh data");
                setLoading(false);
            });
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !analyticsData) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error || "Failed to load analytics data."}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Format data for charts
    const formatActivityData = () => {
        if (!analyticsData.recentActivity || analyticsData.recentActivity.length === 0) {
            return [];
        }

        return analyticsData.recentActivity.map(day => ({
            date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: parseInt(day.count)
        }));
    };

    const formatIntentData = () => {
        if (!analyticsData.intentDistribution || analyticsData.intentDistribution.length === 0) {
            return [];
        }

        return analyticsData.intentDistribution.map(item => ({
            name: item.intent || 'unknown',
            value: parseInt(item.count)
        }));
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Global Analytics Dashboard</h1>

                <div className="flex space-x-4 items-center">
                    <div className="flex bg-[#1b2539] rounded-md">
                        <button
                            onClick={() => setTimeRange("7")}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                timeRange === "7" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setTimeRange("30")}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                timeRange === "30" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setTimeRange("90")}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                timeRange === "90" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            90 Days
                        </button>
                    </div>

                    <button
                        onClick={refreshData}
                        className="p-2 bg-[#1b2539] text-gray-400 hover:text-white rounded-md transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold">{analyticsData.totalUsers || 0}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-full">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Chatbots</p>
                                <p className="text-2xl font-bold">{analyticsData.totalChatbots || 0}</p>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-full">
                                <MessageSquare className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Conversations</p>
                                <p className="text-2xl font-bold">{analyticsData.totalConversations || 0}</p>
                            </div>
                            <div className="bg-green-600/20 p-3 rounded-full">
                                <BarChart2 className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Avg. Conversion Rate</p>
                                <p className="text-2xl font-bold">{analyticsData.averageConversionRate?.toFixed(1) || 0}%</p>
                            </div>
                            <div className="bg-red-600/20 p-3 rounded-full">
                                <TrendingUp className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Activity Chart */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center mb-4">
                            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold">Conversation Activity</h3>
                        </div>
                        <div className="h-80 w-full">
                            {formatActivityData().length > 0 ? (
                                <DynamicLineChart
                                    data={formatActivityData()}
                                    xDataKey="date"
                                    yDataKey="count"
                                    primaryColor="#3b82f6"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No activity data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Intent Distribution Chart */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Intent Distribution</h3>
                        <div className="h-80 w-full">
                            {formatIntentData().length > 0 ? (
                                <DynamicPieChart
                                    data={formatIntentData()}
                                    dataKey="value"
                                    nameKey="name"
                                    colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No intent data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Chatbots */}
            {analyticsData.topPerformingChatbots && (
                <Card className="bg-[#1b2539] border-0 mb-6">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Top Performing Chatbots</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-2 px-3 text-left">Name</th>
                                    <th className="py-2 px-3 text-left">Users</th>
                                    <th className="py-2 px-3 text-left">Conversions</th>
                                    <th className="py-2 px-3 text-left">Conversion Rate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analyticsData.topPerformingChatbots.map((bot, index) => (
                                    <tr key={index} className="border-b border-gray-800 hover:bg-[#232b3c]">
                                        <td className="py-2 px-3">{bot.name}</td>
                                        <td className="py-2 px-3">{bot.total_users}</td>
                                        <td className="py-2 px-3">{bot.conversions}</td>
                                        <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            parseFloat(bot.conversion_rate) > 10
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          {bot.conversion_rate}%
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Active Chatbots */}
            {analyticsData.topChatbots && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Most Active Chatbots</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-2 px-3 text-left">Name</th>
                                    <th className="py-2 px-3 text-left">Users</th>
                                    <th className="py-2 px-3 text-left">Messages</th>
                                    <th className="py-2 px-3 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analyticsData.topChatbots.map((bot, index) => (
                                    <tr key={index} className="border-b border-gray-800 hover:bg-[#232b3c]">
                                        <td className="py-2 px-3">{bot.name}</td>
                                        <td className="py-2 px-3">{bot.user_count}</td>
                                        <td className="py-2 px-3">{bot.message_count}</td>
                                        <td className="py-2 px-3">
                                            <a href={`/admin/chatbots?api_key=${bot.api_key}`} className="text-blue-500 hover:text-blue-400">
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}