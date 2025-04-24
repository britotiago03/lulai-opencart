"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { TimeRangeSelector } from "@/components/admin-dashboard/analytics/TimeRangeSelector";
import { KeyMetricsGrid } from "@/components/admin-dashboard/analytics/KeyMetricsGrid";
import { ChartSection } from "@/components/admin-dashboard/analytics/ChartSection";
import { ChatbotTable } from "@/components/admin-dashboard/analytics/ChatbotTable";
import { ErrorCard } from "@/components/admin-dashboard/analytics/ErrorCard";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Admin-specific chart wrappers with proper props
import AdminLineChart from "@/components/admin-dashboard/analytics/charts/AdminLineChart";
import AdminPieChart from "@/components/admin-dashboard/analytics/charts/AdminPieChart";

// Define admin-specific analytics data structure
interface AdminAnalyticsData {
    totalUsers: number;
    totalChatbots: number;
    totalConversations: number;
    totalConversions: number;
    conversionRate: number;
    averageConversionRate: number;

    recentActivity: Array<{ date: string; count: string }>;
    intentDistribution: Array<{ intent: string; count: string }>;

    topPerformingChatbots: Array<{
        name: string;
        total_users: number;
        conversions: number;
        conversion_rate: string;
    }>;

    topChatbots: Array<{
        name: string;
        user_count: number;
        message_count: number;
        api_key: string;
    }>;
}

// ✅ Extracted reusable type
type TopPerformingBot = AdminAnalyticsData["topPerformingChatbots"][number];

export default function AdminAnalyticsPage() {
    // Use admin auth hook instead of regular session
    const { isLoading, isAdmin } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState("30");

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
            if (!response.ok) {
                console.error(`Fetch failed with status ${response.status}`);
                setError("Failed to load analytics data. Please try again.");
                setAnalyticsData(null);
                return;
            }

            const data = await response.json();

            // Optional fallback patching if backend doesn't return these
            data.totalChatbots = data.topChatbots?.length ?? 0;
            data.averageConversionRate = data.topPerformingChatbots?.length
                ? data.topPerformingChatbots.reduce(
                (sum: number, bot: TopPerformingBot) =>
                    sum + parseFloat(bot.conversion_rate),
                0
            ) / data.topPerformingChatbots.length
                : 0;

            setAnalyticsData(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError("Failed to load analytics data. Please try again.");
            setAnalyticsData(null);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        // Only fetch analytics after confirming admin status
        if (!isLoading && isAdmin) {
            void fetchAnalyticsData();
        }
    }, [isLoading, isAdmin, fetchAnalyticsData]);

    // Show loading while admin auth is being checked
    if (isLoading || loading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null; // The hook will handle redirection
    }

    const refreshData = () => {
        void fetchAnalyticsData();
    };

    if (error || !analyticsData) return <ErrorCard error={error} />;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Global Analytics Dashboard</h1>

                <div className="flex space-x-4 items-center">
                    <TimeRangeSelector
                        currentTimeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                    />

                    <button
                        onClick={refreshData}
                        className="p-2 bg-[#1b2539] text-gray-400 hover:text-white rounded-md transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <KeyMetricsGrid data={analyticsData} />

            <ChartSection
                analyticsData={analyticsData}
                LineChart={AdminLineChart}
                PieChart={AdminPieChart}
            />

            {analyticsData.topPerformingChatbots?.length > 0 && (
                <ChatbotTable
                    data={analyticsData.topPerformingChatbots}
                    title="Top Performing Chatbots"
                    columns={["Name", "Users", "Conversions", "Conversion Rate"]}
                    type="performance"
                />
            )}

            {analyticsData.topChatbots?.length > 0 && (
                <ChatbotTable
                    data={analyticsData.topChatbots}
                    title="Most Active Chatbots"
                    columns={["Name", "Users", "Messages", "Actions"]}
                    type="activity"
                />
            )}
        </div>
    );
}