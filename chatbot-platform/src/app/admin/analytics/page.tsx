// src/app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Users,
    MessageSquare,
    CreditCard,
    TrendingUp,
    Calendar,
    Download
} from 'lucide-react';

interface AnalyticsData {
    userStats: {
        totalUsers: number;
        newUsersToday: number;
        activeUsers: number;
        userGrowth: number;
    };
    chatbotStats: {
        totalChatbots: number;
        activeChatbots: number;
        chatbotsCreatedToday: number;
        averageChatbotsPerUser: number;
    };
    conversationStats: {
        totalConversations: number;
        conversationsToday: number;
        averageMessagesPerConversation: number;
        conversionRate: number;
    };
    subscriptionStats: {
        totalSubscriptions: number;
        activeSubscriptions: number;
        trialSubscriptions: number;
        mrr: number;
        arr: number;
    };
    userGrowthData: {
        date: string;
        users: number;
    }[];
    conversationData: {
        date: string;
        conversations: number;
        messages: number;
    }[];
    revenueData: {
        date: string;
        revenue: number;
    }[];
    planDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    industryDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    topFeaturesUsed: {
        name: string;
        count: number;
    }[];
}

export default function AdminAnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // In a real application, this would be an API call
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Mocked analytics data
                const mockData: AnalyticsData = {
                    userStats: {
                        totalUsers: 245,
                        newUsersToday: 8,
                        activeUsers: 187,
                        userGrowth: 12.5
                    },
                    chatbotStats: {
                        totalChatbots: 376,
                        activeChatbots: 298,
                        chatbotsCreatedToday: 5,
                        averageChatbotsPerUser: 1.53
                    },
                    conversationStats: {
                        totalConversations: 15789,
                        conversationsToday: 432,
                        averageMessagesPerConversation: 8.2,
                        conversionRate: 6.8
                    },
                    subscriptionStats: {
                        totalSubscriptions: 212,
                        activeSubscriptions: 187,
                        trialSubscriptions: 25,
                        mrr: 8950,
                        arr: 107400
                    },
                    userGrowthData: [
                        { date: '2023-01-01', users: 120 },
                        { date: '2023-02-01', users: 132 },
                        { date: '2023-03-01', users: 145 },
                        { date: '2023-04-01', users: 160 },
                        { date: '2023-05-01', users: 178 },
                        { date: '2023-06-01', users: 190 },
                        { date: '2023-07-01', users: 212 },
                        { date: '2023-08-01', users: 225 },
                        { date: '2023-09-01', users: 245 }
                    ],
                    conversationData: [
                        { date: '2023-01-01', conversations: 980, messages: 7840 },
                        { date: '2023-02-01', conversations: 1120, messages: 8960 },
                        { date: '2023-03-01', conversations: 1340, messages: 10720 },
                        { date: '2023-04-01', conversations: 1560, messages: 12480 },
                        { date: '2023-05-01', conversations: 1780, messages: 14240 },
                        { date: '2023-06-01', conversations: 1920, messages: 15360 },
                        { date: '2023-07-01', conversations: 2240, messages: 17920 },
                        { date: '2023-08-01', conversations: 2460, messages: 19680 },
                        { date: '2023-09-01', conversations: 2690, messages: 21520 }
                    ],
                    revenueData: [
                        { date: '2023-01-01', revenue: 5400 },
                        { date: '2023-02-01', revenue: 5800 },
                        { date: '2023-03-01', revenue: 6200 },
                        { date: '2023-04-01', revenue: 6800 },
                        { date: '2023-05-01', revenue: 7400 },
                        { date: '2023-06-01', revenue: 7900 },
                        { date: '2023-07-01', revenue: 8200 },
                        { date: '2023-08-01', revenue: 8600 },
                        { date: '2023-09-01', revenue: 8950 }
                    ],
                    planDistribution: [
                        { name: 'Basic', value: 92, color: '#6B7280' },
                        { name: 'Professional', value: 85, color: '#3B82F6' },
                        { name: 'Enterprise', value: 35, color: '#8B5CF6' }
                    ],
                    industryDistribution: [
                        { name: 'Retail', value: 68, color: '#10B981' },
                        { name: 'Fashion', value: 45, color: '#F59E0B' },
                        { name: 'Electronics', value: 32, color: '#3B82F6' },
                        { name: 'Food', value: 25, color: '#EF4444' },
                        { name: 'Beauty', value: 20, color: '#EC4899' },
                        { name: 'Other', value: 55, color: '#6B7280' }
                    ],
                    topFeaturesUsed: [
                        { name: 'AI Responses', count: 4250 },
                        { name: 'Product Recommendations', count: 3780 },
                        { name: 'Order Tracking', count: 2950 },
                        { name: 'FAQ Responses', count: 2680 },
                        { name: 'Shipping Information', count: 2120 }
                    ]
                };

                setAnalyticsData(mockData);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setError('Failed to load analytics data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [dateRange]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
    };

    // Determine date range for display in charts
    const getFilteredData = (data: any[]) => {
        if (!data || data.length === 0) return [];

        const today = new Date();
        let cutoffDate;

        switch (dateRange) {
            case '7days':
                cutoffDate = new Date(today.setDate(today.getDate() - 7));
                break;
            case '90days':
                cutoffDate = new Date(today.setDate(today.getDate() - 90));
                break;
            case 'year':
                cutoffDate = new Date(today.setFullYear(today.getFullYear() - 1));
                break;
            case '30days':
            default:
                cutoffDate = new Date(today.setDate(today.getDate() - 30));
                break;
        }

        return data.filter(item => new Date(item.date) >= cutoffDate);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-center items-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <span className="ml-3">Loading analytics data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center text-red-400">
                        {error}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!analyticsData) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Platform Analytics</h1>

                <div className="flex flex-wrap gap-2">
                    <div className="flex bg-[#232b3c] border border-gray-700 rounded-md overflow-hidden">
                        <button
                            className={`px-3 py-2 text-sm ${dateRange === '7days' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setDateRange('7days')}
                        >
                            7 Days
                        </button>
                        <button
                            className={`px-3 py-2 text-sm ${dateRange === '30days' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setDateRange('30days')}
                        >
                            30 Days
                        </button>
                        <button
                            className={`px-3 py-2 text-sm ${dateRange === '90days' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setDateRange('90days')}
                        >
                            90 Days
                        </button>
                        <button
                            className={`px-3 py-2 text-sm ${dateRange === 'year' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setDateRange('year')}
                        >
                            1 Year
                        </button>
                    </div>

                    <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Users */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                            <div className="bg-blue-600/20 p-3 rounded-full">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-sm px-2 py-1 bg-green-900/30 text-green-400 rounded-full flex items-center">
                                +{analyticsData.userStats.userGrowth}%
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-200">Total Users</h3>
                        <div className="text-3xl font-bold mt-1">{analyticsData.userStats.totalUsers}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            {analyticsData.userStats.newUsersToday} new today
                        </div>
                    </CardContent>
                </Card>

                {/* Chatbots */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                            <div className="bg-purple-600/20 p-3 rounded-full">
                                <MessageSquare className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="text-sm px-2 py-1 bg-green-900/30 text-green-400 rounded-full flex items-center">
                                {analyticsData.chatbotStats.chatbotsCreatedToday} new
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-200">Total Chatbots</h3>
                        <div className="text-3xl font-bold mt-1">{analyticsData.chatbotStats.totalChatbots}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            {analyticsData.chatbotStats.activeChatbots} active now
                        </div>
                    </CardContent>
                </Card>

                {/* Conversations */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                            <div className="bg-green-600/20 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="text-sm px-2 py-1 bg-green-900/30 text-green-400 rounded-full flex items-center">
                                {analyticsData.conversationStats.conversationsToday} today
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-200">Conversations</h3>
                        <div className="text-3xl font-bold mt-1">{analyticsData.conversationStats.totalConversations.toLocaleString()}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            {analyticsData.conversationStats.conversionRate}% conversion rate
                        </div>
                    </CardContent>
                </Card>

                {/* MRR */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                            <div className="bg-yellow-600/20 p-3 rounded-full">
                                <CreditCard className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="text-sm px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full flex items-center">
                                {analyticsData.subscriptionStats.activeSubscriptions} active
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-200">Monthly Revenue</h3>
                        <div className="text-3xl font-bold mt-1">{formatCurrency(analyticsData.subscriptionStats.mrr)}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            ARR: {formatCurrency(analyticsData.subscriptionStats.arr)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Growth Chart */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">User Growth</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={getFilteredData(analyticsData.userGrowthData)}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        labelStyle={{ color: '#E5E7EB' }}
                                        formatter={(value: any) => [value, 'Users']}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        name="Total Users"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Monthly Revenue</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={getFilteredData(analyticsData.revenueData)}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        labelStyle={{ color: '#E5E7EB' }}
                                        formatter={(value: any) => [`$${value}`, 'Revenue']}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        name="Monthly Revenue"
                                        fill="#10B981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Conversations Chart */}
                <Card className="bg-[#1b2539] border-0 col-span-1 lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Conversations & Messages</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={getFilteredData(analyticsData.conversationData)}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        yAxisId="left"
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        yAxisId="right"
                                        orientation="right"
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        labelStyle={{ color: '#E5E7EB' }}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="conversations"
                                        name="Conversations"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        yAxisId="left"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="messages"
                                        name="Messages"
                                        stroke="#F59E0B"
                                        strokeWidth={2}
                                        yAxisId="right"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Plan Distribution */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Subscription Plans</h3>
                        <div className="h-80 flex flex-col justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analyticsData.planDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        formatter={(value: any, name: any) => [`${value} users`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {analyticsData.planDistribution.map((plan, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-sm font-medium">{plan.name}</div>
                                        <div className="text-gray-400 text-xs">{plan.value} users</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Industry Distribution */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Industries</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analyticsData.industryDistribution}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                    <XAxis type="number" stroke="#6B7280" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#6B7280"
                                        tick={{ fontSize: 14 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        formatter={(value: any) => [`${value} users`, 'Count']}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 4, 4, 0]}
                                    >
                                        {analyticsData.industryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Features Used */}
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Top Features Used</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analyticsData.topFeaturesUsed}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                    <XAxis type="number" stroke="#6B7280" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#6B7280"
                                        tick={{ fontSize: 14 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                                        formatter={(value: any) => [`${value} uses`, 'Count']}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3B82F6"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}