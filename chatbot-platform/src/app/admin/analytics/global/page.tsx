"use client";

import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import TimeRangeSelector from "@/components/dashboard/analytics/TimeRangeSelector";
import KeyMetrics from "@/components/dashboard/analytics/KeyMetrics";
import ConversationActivityChart from "@/components/dashboard/analytics/ConversationActivityChart";
import IntentDistributionChart from "@/components/dashboard/analytics/IntentDistributionChart";
import CartOperationsCard from "@/components/dashboard/analytics/CartOperationsCard";
import EnhancedCartOperationsCard from "@/components/dashboard/analytics/EnhancedCartOperationsCard";
import ImprovedNavigationActionsCard from "@/components/dashboard/analytics/ImprovedNavigationActionsCard";
import TopQueries from "@/components/dashboard/analytics/TopQueries";
import TopProductsCard from "@/components/dashboard/analytics/TopProductsCard";
import EnhancedUserIntentInsights from "@/components/dashboard/analytics/EnhancedUserIntentInsights";
import EnhancedConversationFlowCard from "@/components/dashboard/analytics/EnhancedConversationFlowCard";
import { AdminTopChatbots } from "@/components/dashboard/analytics/PerformanceTables";
import { aggregateCartOps, aggregateNavActions } from "@/utils/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GlobalAnalyticsPage() {
    // Use admin auth hook to verify admin status
    const { isLoading: authLoading, isAdmin } = useAdminAuth();
    
    // Use the analytics hook without a chatbot ID to get platform-wide data
    const { session, data, loading, error,
        timeRange, setTimeRange, refresh } = useAnalytics();

    // Handle authentication loading state
    if (authLoading) return <LoadingSkeleton />;

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null; // The hook will handle redirection
    }

    // Handle analytics loading/error states
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return (
        <div className="max-w-7xl mx-auto p-6">
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6 text-center">
                    <p className="text-red-400 mb-4">{error ?? "Failed to load analytics."}</p>
                    <button onClick={()=>location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Try Again
                    </button>
                </CardContent>
            </Card>
        </div>
    );

    /* ---------- transformed datasets ---------- */
    const daily = (data.recentActivity ?? data.dailyStats ?? []).map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        count: d.conversation_count || d.count || 0,
        messages: d.message_count || d.messages || 0
    }));
    const intent = data.intentDistribution;
    const cartOps = aggregateCartOps(data.chatbotStats ?? []);
    const navAct = aggregateNavActions(data.chatbotStats ?? []);

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <Link href="/admin/analytics" className="flex items-center text-blue-500 hover:text-blue-400 mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to chatbot selection
                    </Link>
                    <h1 className="text-2xl font-bold">Global Platform Analytics</h1>
                    <p className="text-sm text-gray-400">Aggregated data across all chatbots</p>
                </div>
                <TimeRangeSelector
                    value={timeRange}
                    onChangeAction={setTimeRange}
                    onRefreshAction={refresh}
                />
            </div>

            {/* metrics */}
            <KeyMetrics data={data} session={session} />

            {/* charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Platform Conversation Activity</h3>
                        <div className="h-80 w-full">
                            <ConversationActivityChart data={daily}/>
                        </div>
                    </CardContent>
                </Card>

                <IntentDistributionChart items={intent}/>
            </div>

            {/* carts & navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EnhancedCartOperationsCard 
                    items={cartOps} 
                    conversionRate={data.conversionRate}
                    extendedMetrics={true}
                    detailedOperations={data.detailedCartOperations || []}
                    completedPurchases={data.completedPurchases || 0}
                />
                <ImprovedNavigationActionsCard 
                    items={navAct}
                    detailedActions={data.detailedNavigationActions}
                />
            </div>

            {/* top products & queries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <TopProductsCard products={data.topProducts}/>
                <TopQueries list={data.topQueries}/>
            </div>
            
            {/* AI insights and conversation flow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EnhancedUserIntentInsights insights={data.intentInsights} />
                <EnhancedConversationFlowCard data={data.conversationFlow} />
            </div>

            {/* admin-specific tables */}
            {data.topPerformingChatbots && (
                <AdminTopChatbots 
                    list={data.topPerformingChatbots} 
                    title="Top Performing Chatbots"
                />
            )}
        </div>
    );
}