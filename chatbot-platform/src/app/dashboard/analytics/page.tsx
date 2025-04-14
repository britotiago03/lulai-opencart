// src/app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart2,
    Users,
    MessageSquare,
    TrendingUp,
    Clock,
    ShoppingCart,
    ArrowRight,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Activity
} from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import dynamic from "next/dynamic";

// Dynamically import chart components
const DynamicBarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const DynamicPieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const DynamicLineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });

interface AnalyticsData {
    totalConversations: number;
    totalMessages: number;
    activeUsers?: number;
    averageResponseTime: number;
    conversionRate: number;
    recentActivity?: any[];
    dailyStats?: any[];
    intentDistribution?: any[];
    topQueries?: any[];
    cartOperations?: any[];
    navigationActions?: any[];
    chatbotStats?: any[];
    totalCartActions?: number;
    timeRange?: number;
}

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const chatbotId = searchParams.get('chatbotId');

    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState("30"); // "7", "30", "90"
    const [showDetails, setShowDetails] = useState({
        intentDistribution: false,
        navigationActions: false,
        cartOperations: false
    });

    // Helper functions to aggregate analytics data from multiple chatbots
    const aggregateCartOperations = (chatbotStats) => {
        const operations = {};

        chatbotStats.forEach(bot => {
            if (bot.cartOperations && bot.cartOperations.length > 0) {
                bot.cartOperations.forEach(op => {
                    if (operations[op.operation]) {
                        operations[op.operation] += parseInt(op.count);
                    } else {
                        operations[op.operation] = parseInt(op.count);
                    }
                });
            }
        });

        return Object.entries(operations)
            .map(([operation, count]) => ({ operation, count }))
            .sort((a, b) => b.count - a.count);
    };

    const aggregateNavigationActions = (chatbotStats) => {
        const actions = {};

        chatbotStats.forEach(bot => {
            if (bot.navigationActions && bot.navigationActions.length > 0) {
                bot.navigationActions.forEach(nav => {
                    if (actions[nav.target]) {
                        actions[nav.target] += parseInt(nav.count);
                    } else {
                        actions[nav.target] = parseInt(nav.count);
                    }
                });
            }
        });

        return Object.entries(actions)
            .map(([target, count]) => ({ target, count }))
            .sort((a, b) => b.count - a.count);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                // Construct API URL with query parameters
                let apiUrl = `/api/analytics?timeRange=${timeRange}`;
                if (chatbotId) {
                    apiUrl += `&chatbotId=${chatbotId}`;
                }

                const response = await fetch(apiUrl);

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

        if (status === "authenticated") {
            fetchAnalytics();
        }
    }, [timeRange, chatbotId, session, status, router]);

    const toggleDetailSection = (section) => {
        setShowDetails(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const refreshData = () => {
        setLoading(true);
        fetch(`/api/analytics?timeRange=${timeRange}${chatbotId ? `&chatbotId=${chatbotId}` : ''}`)
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

    // Function to prepare intent distribution data for charts
    const prepareIntentData = () => {
        if (!analyticsData.intentDistribution || analyticsData.intentDistribution.length === 0) {
            return [];
        }

        return analyticsData.intentDistribution.map(item => ({
            name: item.intent || 'unknown',
            value: parseInt(item.count)
        }));
    };

    // Prepare daily activity data for the line chart
    const prepareDailyActivityData = () => {
        const activityData = analyticsData.recentActivity || analyticsData.dailyStats || [];

        if (activityData.length === 0) {
            return [];
        }

        return activityData.map(day => ({
            date: new Date(day.date).toLocaleDateString(),
            count: parseInt(day.count || day.conversation_count || 0),
            messages: parseInt(day.message_count || 0)
        }));
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">
                    {chatbotId ? `Analytics: ${analyticsData.chatbotName || 'Chatbot'}` : 'Analytics Dashboard'}
                </h1>

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
                                <p className="text-sm text-gray-400">Conversations</p>
                                <p className="text-2xl font-bold">{analyticsData.totalConversations || 0}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-full">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Messages</p>
                                <p className="text-2xl font-bold">{analyticsData.totalMessages || 0}</p>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-full">
                                <BarChart2 className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">
                                    {session?.user?.role === 'admin' && !chatbotId ? 'Total Cart Actions' : 'Conversions'}
                                </p>
                                <p className="text-2xl font-bold">
                                    {analyticsData.totalCartActions || analyticsData.conversions || 0}
                                </p>
                            </div>
                            <div className="bg-green-600/20 p-3 rounded-full">
                                <ShoppingCart className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Conversion Rate</p>
                                <p className="text-2xl font-bold">{analyticsData.conversionRate?.toFixed(2) || 0}%</p>
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
                {/* Conversation Activity Chart */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Conversation Activity</h3>
                        <div className="h-80 w-full">
                            {prepareDailyActivityData().length > 0 ? (
                                <DynamicLineChart
                                    data={prepareDailyActivityData()}
                                    xDataKey="date"
                                    yDataKey="count"
                                    secondaryDataKey="messages"
                                    primaryColor="#3b82f6"
                                    secondaryColor="#8b5cf6"
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Intent Distribution</h3>
                            <button
                                onClick={() => toggleDetailSection('intentDistribution')}
                                className="text-gray-400 hover:text-white"
                            >
                                {showDetails.intentDistribution ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="h-80 w-full">
                            {prepareIntentData().length > 0 ? (
                                <DynamicPieChart
                                    data={prepareIntentData()}
                                    dataKey="value"
                                    nameKey="name"
                                    colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#6366f1']}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No intent data available
                                </div>
                            )}
                        </div>

                        {/* Expanded Intent Details */}
                        {showDetails.intentDistribution && analyticsData.intentDistribution && (
                            <div className="mt-4 border-t border-gray-700 pt-4">
                                <h4 className="font-medium mb-2">Intent Details</h4>
                                <div className="space-y-3">
                                    {analyticsData.intentDistribution.map((intent, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'][index % 5] }}
                                                />
                                                <span className="capitalize">{intent.intent || 'unknown'}</span>
                                            </div>
                                            <span className="text-gray-400">{intent.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Cart Operations & Navigation Actions */}
            {chatbotId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Cart Operations Card */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Cart Operations</h3>
                                <button
                                    onClick={() => toggleDetailSection('cartOperations')}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {showDetails.cartOperations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>

                            {analyticsData.cartOperations && analyticsData.cartOperations.length > 0 ? (
                                <div className="space-y-4">
                                    {analyticsData.cartOperations.map((op, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-medium capitalize">{op.operation || 'unknown'}</p>
                                                    <p className="text-gray-400">{op.count} operations</p>
                                                </div>
                                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{
                                                            width: analyticsData.cartOperations && analyticsData.cartOperations[0] ?
                                                                `${(op.count / analyticsData.cartOperations[0].count) * 100}%` : '0%'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    No cart operations data available
                                </div>
                            )}

                            {/* Extended Cart Operations Details */}
                            {showDetails.cartOperations && analyticsData.cartOperations && analyticsData.cartOperations.length > 0 && (
                                <div className="mt-6 border-t border-gray-700 pt-4">
                                    <h4 className="font-medium mb-3">Conversion Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#232b3c] p-3 rounded-md">
                                            <p className="text-sm text-gray-400">Success Rate</p>
                                            <p className="text-xl font-semibold">{analyticsData.conversionRate?.toFixed(1)}%</p>
                                        </div>
                                        <div className="bg-[#232b3c] p-3 rounded-md">
                                            <p className="text-sm text-gray-400">Cart Add Actions</p>
                                            <p className="text-xl font-semibold">
                                                {analyticsData.cartOperations.find(op => op.operation === 'add')?.count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation Actions Card */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Navigation Actions</h3>
                                <button
                                    onClick={() => toggleDetailSection('navigationActions')}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {showDetails.navigationActions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>

                            {analyticsData.navigationActions && analyticsData.navigationActions.length > 0 ? (
                                <div className="space-y-4">
                                    {analyticsData.navigationActions.map((nav, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-medium">{nav.target || 'Unknown'}</p>
                                                    <p className="text-gray-400">{nav.count} navigations</p>
                                                </div>
                                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: analyticsData.navigationActions && analyticsData.navigationActions[0] ?
                                                                `${(nav.count / analyticsData.navigationActions[0].count) * 100}%` : '0%'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    No navigation data available
                                </div>
                            )}

                            {/* Expanded Navigation Details */}
                            {showDetails.navigationActions && analyticsData.navigationActions && analyticsData.navigationActions.length > 0 && (
                                <div className="mt-6 border-t border-gray-700 pt-4">
                                    <h4 className="font-medium mb-3">Top Navigation Destinations</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {analyticsData.navigationActions.slice(0, 4).map((nav, index) => (
                                            <div key={index} className="bg-[#232b3c] p-2 rounded flex justify-between items-center">
                                                <span className="text-sm">{nav.target}</span>
                                                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">
                                                    {nav.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Cart Operations & Navigation Actions for all chatbots */}
            {!chatbotId && analyticsData.chatbotStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Cart Operations Card - Show aggregated data */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Cart Operations</h3>
                                <button
                                    onClick={() => toggleDetailSection('cartOperations')}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {showDetails.cartOperations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>

                            {analyticsData.chatbotStats.some(bot => bot.cartOperations && bot.cartOperations.length > 0) ? (
                                <div className="space-y-4">
                                    {/* Aggregate cart operations from all chatbots */}
                                    {aggregateCartOperations(analyticsData.chatbotStats).map((op, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-medium capitalize">{op.operation || 'unknown'}</p>
                                                    <p className="text-gray-400">{op.count} operations</p>
                                                </div>
                                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(op.count / aggregateCartOperations(analyticsData.chatbotStats)[0].count) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    No cart operations data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation Actions Card - Show aggregated data */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Navigation Actions</h3>
                                <button
                                    onClick={() => toggleDetailSection('navigationActions')}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {showDetails.navigationActions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>

                            {analyticsData.chatbotStats.some(bot => bot.navigationActions && bot.navigationActions.length > 0) ? (
                                <div className="space-y-4">
                                    {/* Aggregate navigation actions from all chatbots */}
                                    {aggregateNavigationActions(analyticsData.chatbotStats).map((nav, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <p className="font-medium">{nav.target || 'Unknown'}</p>
                                                    <p className="text-gray-400">{nav.count} navigations</p>
                                                </div>
                                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(nav.count / aggregateNavigationActions(analyticsData.chatbotStats)[0].count) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    No navigation data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Top Queries Card */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Top User Queries</h3>
                    {analyticsData.topQueries && analyticsData.topQueries.length > 0 ? (
                        <div className="space-y-3">
                            {analyticsData.topQueries.map((query, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-[#232b3c] rounded-md">
                                    <span className="truncate max-w-[80%]">{query.message_content}</span>
                                    <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full text-xs">
                                        {query.count} times
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-8">
                            No query data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* For Admin: Top Performing Chatbots */}
            {session?.user?.role === 'admin' && !chatbotId && analyticsData.topPerformingChatbots && (
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

            {/* For Client: Individual Chatbot Performance */}
            {session?.user?.role !== 'admin' && !chatbotId && analyticsData.chatbotStats && analyticsData.chatbotStats.length > 0 && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Your Chatbot Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-2 px-3 text-left">Name</th>
                                    <th className="py-2 px-3 text-left">Conversations</th>
                                    <th className="py-2 px-3 text-left">Messages</th>
                                    <th className="py-2 px-3 text-left">Conversions</th>
                                    <th className="py-2 px-3 text-left">Conversion Rate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analyticsData.chatbotStats.map((bot, index) => (
                                    <tr key={index} className="border-b border-gray-800 hover:bg-[#232b3c]">
                                        <td className="py-2 px-3">{bot.name}</td>
                                        <td className="py-2 px-3">{bot.totalConversations}</td>
                                        <td className="py-2 px-3">{bot.totalMessages}</td>
                                        <td className="py-2 px-3">{bot.conversions}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                bot.conversionRate > 10
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-blue-900/30 text-blue-400'
                                            }`}>
                                              {bot.conversionRate.toFixed(1)}%
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
        </div>
    );
}