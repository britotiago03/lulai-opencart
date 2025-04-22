// src/components/admin-dashboard/analytics/KeyMetricsGrid.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, BarChart2, TrendingUp } from "lucide-react";

interface KeyMetricsGridProps {
    data: {
        totalUsers: number;
        totalChatbots: number;
        totalConversations: number;
        averageConversionRate: number;
    };
}

export const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
                title="Total Users"
                value={data.totalUsers || 0}
                icon={<Users className="h-5 w-5 text-blue-500" />}
                bgColor="blue"
            />
            <MetricCard
                title="Total Chatbots"
                value={data.totalChatbots || 0}
                icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                bgColor="purple"
            />
            <MetricCard
                title="Total Conversations"
                value={data.totalConversations || 0}
                icon={<BarChart2 className="h-5 w-5 text-green-500" />}
                bgColor="green"
            />
            <MetricCard
                title="Avg. Conversion Rate"
                value={`${data.averageConversionRate?.toFixed(1) || 0}%`}
                icon={<TrendingUp className="h-5 w-5 text-red-500" />}
                bgColor="red"
            />
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, bgColor }) => {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <div className={`bg-${bgColor}-600/20 p-3 rounded-full`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};