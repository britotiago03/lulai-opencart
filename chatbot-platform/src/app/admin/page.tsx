// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, MessageSquare, BarChart2, Settings, Bell, Database } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";

function AdminDashboardPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalChatbots: 0,
        totalConversations: 0,
        activeAlerts: 0,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated" && !session?.user.adminAuthOrigin) {
            router.push("/dashboard");
            return;
        }

        // Fetch admin statistics from real database
        const fetchStats = async () => {
            try {
                // Fetch real data from analytics endpoint
                const response = await fetch('/api/analytics', {
                    headers: { 'Cache-Control': 'no-cache' }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const analyticsData = await response.json();

                // Fetch chatbots count
                const chatbotsResponse = await fetch('/api/chatbots');
                const chatbotsData = await chatbotsResponse.json();

                // Fetch users count
                const usersResponse = await fetch('/api/admin/users/count');
                const usersData = await usersResponse.json();

                setStats({
                    totalUsers: usersData.count || 0,
                    activeSubscriptions: analyticsData.averageConversationsPerChatbot ?
                        Math.round(analyticsData.averageConversationsPerChatbot) : 0,
                    totalChatbots: chatbotsData.length || 0,
                    totalConversations: analyticsData.totalConversations || 0,
                    activeAlerts: analyticsData.totalCartActions ?
                        (analyticsData.totalCartActions > 100 ? 1 : 0) : 0, // Set alert if high cart actions
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                setLoading(false);
            }
        };

        fetchStats();
    }, [session, status, router]);

    if (loading) {
        return <LoadingSkeleton />;
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
            description: "Track payments, plans, and renewals",
            icon: Database,
            link: "/admin/subscriptions",
            stat: stats.activeSubscriptions,
            statLabel: "Active Subscriptions",
        },
        {
            title: "Chatbot Monitoring",
            description: "Monitor all chatbots across the platform",
            icon: MessageSquare,
            link: "/admin/chatbots",
            stat: stats.totalChatbots,
            statLabel: "Total Chatbots",
        },
        {
            title: "Conversations",
            description: "View all user-chatbot interactions",
            icon: MessageSquare, // Use MessageCircle if available
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
            statLabel: "Total Conversations",
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

    // Show loading state while checking authentication
    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4">Verifying access...</p>
                </div>
            </div>
        );
    }

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

export default function AdminDashboardPage() {
    return (
        <AdminSessionProvider>
            <AdminDashboardPageContent />
        </AdminSessionProvider>
    )
}