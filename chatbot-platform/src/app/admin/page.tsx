"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, BarChart2, Settings, Bell, CreditCard } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminDashboard() {
    const { isLoading, isAdmin } = useAdminAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalChatbots: 0,
        totalConversations: 0,
        activeAlerts: 0,
    });
    const [fetchingStats, setFetchingStats] = useState(true);

    useEffect(() => {
        // Only fetch stats after we've confirmed admin status
        if (!isLoading && isAdmin) {
            const fetchStats = async () => {
                try {
                    // Fetch data from existing API endpoints
                    const [usersCountRes, chatbotsRes, analyticsRes] = await Promise.all([
                        fetch('/api/admin/users/count'),
                        fetch('/api/admin/chatbots'),
                        fetch('/api/admin/analytics')
                    ]);

                    const [usersCount, chatbots, analytics] = await Promise.all([
                        usersCountRes.json(),
                        chatbotsRes.json(),
                        analyticsRes.json()
                    ]);

                    // Define interface for chatbot objects
                    interface Chatbot {
                        id: string | number;
                        name: string;
                        status: string;
                        userId: string | number;
                        userName: string;
                        userEmail: string;
                        // Other properties may exist, but we only need status for filtering
                    }

                    // Extract relevant stats from the API responses and properly type the chatbots
                    setStats({
                        totalUsers: usersCount.count,
                        activeSubscriptions: (chatbots as Chatbot[]).filter(bot => bot.status === 'active').length,
                        totalChatbots: chatbots.length,
                        totalConversations: analytics.totalConversations,
                        activeAlerts: 0, // Currently no alert system in the provided APIs
                    });
                } catch (error) {
                    console.error("Error fetching admin stats:", error);
                    // Optionally show error state to the user
                } finally {
                    setFetchingStats(false);
                }
            };

            void fetchStats();
        }
    }, [isLoading, isAdmin]);

    // Show loading while checking auth or fetching stats
    if (isLoading || fetchingStats) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    const adminCards = [
        {
            title: "User Management",
            description: "View and manage all platform users",
            icon: Users,
            link: "/admin/users",
            stat: stats.totalUsers,
            statLabel: "Total Users",
        },
        {
            title: "Subscription Management",
            description: "Track payments, plans, and billing",
            icon: CreditCard,
            link: "/admin/subscriptions",
            stat: stats.activeSubscriptions,
            statLabel: "Active Subscriptions",
        },
        {
            title: "Chatbot Monitoring",
            description: "Monitor all active chatbots across the platform",
            icon: MessageSquare,
            link: "/admin/chatbots",
            stat: stats.totalChatbots,
            statLabel: "Total Chatbots",
        },
        {
            title: "Conversations",
            description: "View all user-chatbot interactions",
            icon: MessageSquare,
            link: "/admin/conversations",
            stat: stats.totalConversations,
            statLabel: "Total Conversations",
        },
        {
            title: "Global Analytics",
            description: "View platform-wide metrics and usage data",
            icon: BarChart2,
            link: "/admin/analytics",
            stat: stats.totalConversations,
            statLabel: "All Interactions",
        },
        {
            title: "Admin Settings",
            description: "Configure platform settings and defaults",
            icon: Settings,
            link: "/admin/settings",
            stat: null,
            statLabel: null,
        },
        {
            title: "System Alerts",
            description: "Review system warnings and security logs",
            icon: Bell,
            link: "/admin/alerts",
            stat: stats.activeAlerts,
            statLabel: "Active Alerts",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">
                    Manage users, subscriptions, and monitor platform activity
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card, index) => (
                    <Link key={index} href={card.link}>
                        <Card className="h-full bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors cursor-pointer">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-blue-600/20 p-3 rounded-full">
                                        <card.icon className="h-6 w-6 text-blue-500" />
                                    </div>
                                    {card.stat !== null && (
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{card.stat}</p>
                                            <p className="text-sm text-gray-400">{card.statLabel}</p>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                                <p className="text-gray-400 text-sm">{card.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}