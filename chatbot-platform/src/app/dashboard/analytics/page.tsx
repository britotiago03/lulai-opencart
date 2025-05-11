"use client";

import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import TimeRangeSelector from "@/components/dashboard/analytics/TimeRangeSelector";
import KeyMetrics from "@/components/dashboard/analytics/KeyMetrics";
import ConversationActivityChart from "@/components/dashboard/analytics/ConversationActivityChart";
import IntentDistributionChart from "@/components/dashboard/analytics/IntentDistributionChart";
import CartOperationsCard from "@/components/dashboard/analytics/CartOperationsCard";
import EnhancedCartOperationsCard from "@/components/dashboard/analytics/EnhancedCartOperationsCard";
import NavigationActionsCard from "@/components/dashboard/analytics/NavigationActionsCard";
import TopQueries from "@/components/dashboard/analytics/TopQueries";
import TopProductsCard from "@/components/dashboard/analytics/TopProductsCard";
import { AdminTopChatbots, ClientChatbotStats } from "@/components/dashboard/analytics/PerformanceTables";
import { aggregateCartOps, aggregateNavActions } from "@/utils/analytics";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
    const { session, chatbotId, data, loading, error,
        timeRange, setTimeRange, refresh } = useAnalytics();

    if (loading)          return <LoadingSkeleton />;
    if (error || !data)   return (
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
    const intent  = data.intentDistribution;
    const cartOps = chatbotId ? data.cartOperations : aggregateCartOps(data.chatbotStats ?? []);
    const navAct  = chatbotId ? data.navigationActions : aggregateNavActions(data.chatbotStats ?? []);

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">
                    {chatbotId ? `Analytics: ${data.chatbotName ?? "Chatbot"}` : "Analytics Dashboard"}
                </h1>
                <TimeRangeSelector
                    value={timeRange}
                    onChangeAction={setTimeRange}
                    onRefreshAction={refresh}
                />
            </div>

            {/* metrics */}
            <KeyMetrics data={data} session={session} chatbotId={chatbotId}/>

            {/* charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Conversation Activity</h3>
                        <div className="h-80 w-full">
                            <ConversationActivityChart data={daily}/>
                        </div>
                    </CardContent>
                </Card>

                <IntentDistributionChart items={intent}/>
            </div>

            {/* carts & navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {data.detailedCartOperations ? (
                    <EnhancedCartOperationsCard 
                        items={cartOps} 
                        conversionRate={data.conversionRate}
                        extendedMetrics={!!chatbotId}
                        detailedOperations={data.detailedCartOperations}
                        completedPurchases={data.completedPurchases}
                    />
                ) : (
                    <CartOperationsCard 
                        items={cartOps} 
                        conversionRate={data.conversionRate}
                        extendedMetrics={!!chatbotId}
                    />
                )}
                <NavigationActionsCard items={navAct}/>
            </div>

            {/* top products & queries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <TopProductsCard products={data.topProducts}/>
                <TopQueries list={data.topQueries}/>
            </div>

            {/* tables */}
            {session?.user?.role === "admin" && !chatbotId && data.topPerformingChatbots &&
                <AdminTopChatbots list={data.topPerformingChatbots}/>}

            {session?.user?.role !== "admin" && !chatbotId && data.chatbotStats?.length &&
                <ClientChatbotStats list={data.chatbotStats}/>}
        </div>
    );
}
