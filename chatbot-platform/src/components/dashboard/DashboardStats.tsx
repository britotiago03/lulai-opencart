// src/components/dashboard/DashboardStats.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, ArrowUpRight, ArrowDownRight, Zap, Clock } from "lucide-react";

export default function DashboardStats() {
    const [stats, setStats] = useState({
        totalConversations: 0,
        activeUsers: 0,
        conversionRate: 0,
        responseTime: 0
    });

    // In a real app, you would fetch this data from your API
    useEffect(() => {
        // Simulating API call
        setTimeout(() => {
            setStats({
                totalConversations: 1243,
                activeUsers: 829,
                conversionRate: 12.5,
                responseTime: 1.2
            });
        }, 1000);
    }, []);

    const statCards = [
        {
            title: "Total Conversations",
            value: stats.totalConversations.toLocaleString(),
            icon: MessageCircle,
            trend: 12,
            trendUp: true
        },
        {
            title: "Active Users",
            value: stats.activeUsers.toLocaleString(),
            icon: Users,
            trend: 8,
            trendUp: true
        },
        {
            title: "Conversion Rate",
            value: `${stats.conversionRate}%`,
            icon: Zap,
            trend: 2.5,
            trendUp: false
        },
        {
            title: "Avg. Response Time",
            value: `${stats.responseTime}s`,
            icon: Clock,
            trend: 0.3,
            trendUp: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;
                const trendColor = stat.trendUp ? "text-green-500" : "text-red-500";

                return (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <div className={`flex items-center text-xs mt-1 ${trendColor}`}>
                                        <TrendIcon className="h-3 w-3 mr-1" />
                                        <span>{stat.trend}% vs last period</span>
                                    </div>
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Icon className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}