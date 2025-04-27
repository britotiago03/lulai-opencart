"use client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, MessageSquare, ShoppingCart, TrendingUp } from "lucide-react";
import { AnalyticsData } from "@/types/analytics";
import { Session } from "next-auth";
import React from "react";

export default function KeyMetrics({
                                       data, session, chatbotId
                                   }: { data: AnalyticsData; session: Session | null; chatbotId?: string | null }) {
    const metricCard = (
        title: string, value: string | number, icon: React.ReactNode, color: string
    ) => (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <div className={`${color}/20 p-3 rounded-full`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricCard("Conversations",
                data.totalConversations ?? 0,
                <MessageSquare className="h-5 w-5 text-blue-500" />, "bg-blue-600")}
            {metricCard("Total Messages",
                data.totalMessages ?? 0,
                <BarChart2 className="h-5 w-5 text-purple-500" />, "bg-purple-600")}
            {metricCard(
                session?.user?.role === "admin" && !chatbotId ? "Total Cart Actions" : "Conversions",
                data.totalCartActions ?? data.conversions ?? 0,
                <ShoppingCart className="h-5 w-5 text-green-500" />, "bg-green-600")}
            {metricCard("Conversion Rate",
                `${data.conversionRate?.toFixed(2) ?? 0}%`,
                <TrendingUp className="h-5 w-5 text-red-500" />, "bg-red-600")}
        </div>
    );
}
