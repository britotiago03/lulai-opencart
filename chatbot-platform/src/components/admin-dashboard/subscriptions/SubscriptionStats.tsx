// src/components/subscriptions/SubscriptionStats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Database, User, Calendar } from "lucide-react";
import { AdminSubscription, formatCurrency } from "@/types/subscription";

interface SubscriptionStatsProps {
    subscriptions: AdminSubscription[];
}

export default function SubscriptionStats({ subscriptions }: SubscriptionStatsProps) {
    // Count of active subscriptions
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    // Count of pro users
    const proUsers = subscriptions.filter(s => s.plan_type === 'pro').length;

    // Monthly revenue (sum of prices for active subscriptions)
    const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((total, sub) => total + sub.price, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-blue-600/20 p-3 rounded-full">
                            <Database className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{activeSubscriptions}</p>
                            <p className="text-sm text-gray-400">Active Subscriptions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-purple-600/20 p-3 rounded-full">
                            <User className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{proUsers}</p>
                            <p className="text-sm text-gray-400">Pro Users</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-green-600/20 p-3 rounded-full">
                            <Calendar className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                            <p className="text-sm text-gray-400">Monthly Revenue</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}