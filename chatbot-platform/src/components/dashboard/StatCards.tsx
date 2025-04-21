// src/components/dashboard/StatCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import React from "react";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
}

function StatCard({ title, value, icon, bgColor }: StatCardProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <div className={`${bgColor} p-3 rounded-full`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface StatCardsProps {
    stats: DashboardStats;
}

export default function StatCards({ stats }: StatCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* Total Chatbots */}
            <StatCard
                title="Total Chatbots"
                value={stats.totalChatbots}
                bgColor="bg-blue-600/20"
                textColor="text-blue-500"
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                }
            />

            {/* Total Conversations */}
            <StatCard
                title="Total Conversations"
                value={stats.totalConversations}
                bgColor="bg-purple-600/20"
                textColor="text-purple-500"
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                        />
                    </svg>
                }
            />

            {/* Conversion Rate */}
            <StatCard
                title="Conversion Rate"
                value={`${stats.conversionRate}%`}
                bgColor="bg-green-600/20"
                textColor="text-green-500"
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                }
            />

            {/* Average Response Time */}
            <StatCard
                title="Avg. Response Time"
                value={`${stats.averageResponseTime}s`}
                bgColor="bg-yellow-600/20"
                textColor="text-yellow-500"
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                }
            />
        </div>
    );
}