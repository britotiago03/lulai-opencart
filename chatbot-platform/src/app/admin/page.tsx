// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
    Users,
    CreditCard,
    MessageSquare,
    BarChart3,
    Settings,
    ShieldAlert
} from "lucide-react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminSessionProvider from '@/components/admin/AdminSessionProvider';

function AdminDashboardPageContent() {
    const [userCount, setUserCount] = useState<number>(0);
    const [chatbotCount, setChatbotCount] = useState<number>(0);
    const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);
    const [conversationCount, setConversationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const { data: session, status } = useSession();        

    useEffect(() => {
        const checkAdminAccess = async () => {
            // Temporary admin session data check
            // NB: Remove when finished with implementing solution
            console.log('Admin session data:', {
                session,
                status,
                token: document.cookie
            });


            if (status === "unauthenticated") {
                router.push("/home");
                return;
            }

            if (status === "authenticated") {
                try {
                     // Debugging: Log session info
                     console.log('Session info:', {
                        adminAuthOrigin: session?.user?.adminAuthOrigin,
                        isAdmin: session?.user?.isAdmin
                    });

                    // Check for admin origin flag
                    if (!session?.user?.adminAuthOrigin) {
                        console.log('Redirecting to 404 - Missing adminAuthOrigin');
                        router.push("/404");
                        return;
                    }

                    const response = await fetch('/api/admin/verify-admin', {
                        credentials: 'include' // Important for cookies
                    });
                    
                    if (!response.ok) {
                        console.log('Redirecting to 404 - Backend verification failed');
                        throw new Error('Admin verification failed');
                    }
                    
                    const data = await response.json();
                    if (!data.isAdmin) {
                        console.log('Redirecting to 404 - Not admin according to backend');
                        router.push("/404");
                    }
                } catch (error) {
                    console.error('Admin verification error:', error);
                    router.push("/404");
                }
            }
        };

        checkAdminAccess();
    }, [session, status, router]);

    useEffect(() => {
        // Only fetch data if authenticated and verified as admin
        if (status === "authenticated") {
            const fetchAdminStats = async () => {
                try {
                    setLoading(true);

                    // Simulate API data
                    setTimeout(() => {
                        setUserCount(42);
                        setChatbotCount(78);
                        setActiveSubscriptions(35);
                        setConversationCount(1243);
                        setLoading(false);
                    }, 1000);

                    // In the future, you'd replace the above with real API calls:
                    // const userData = await fetch('/api/admin/users/count');
                    // const chatbotData = await fetch('/api/admin/chatbots/count');
                    // etc.

                } catch (error) {
                    console.error('Error fetching admin stats:', error);
                    setLoading(false);
                }
            };

            fetchAdminStats();
        }
    }, [session, status]);

    const adminCards = [
        {
            title: "User Management",
            icon: Users,
            description: "View and manage all platform users",
            link: "/admin/users",
            stat: userCount,
            statLabel: "Total Users"
        },
        {
            title: "Subscription Management",
            icon: CreditCard,
            description: "Track payments, plans, and renewals",
            link: "/admin/subscriptions",
            stat: activeSubscriptions,
            statLabel: "Active Subscriptions"
        },
        {
            title: "Chatbot Monitoring",
            icon: MessageSquare,
            description: "Monitor all chatbots across the platform",
            link: "/admin/chatbots",
            stat: chatbotCount,
            statLabel: "Total Chatbots"
        },
        {
            title: "Global Analytics",
            icon: BarChart3,
            description: "View platform-wide metrics and usage data",
            link: "/admin/analytics",
            stat: conversationCount,
            statLabel: "Total Conversations"
        },
        {
            title: "Admin Settings",
            icon: Settings,
            description: "Configure platform settings and defaults",
            link: "/admin/settings",
            stat: null,
            statLabel: null
        },
        {
            title: "System Alerts",
            icon: ShieldAlert,
            description: "Review system warnings and security logs",
            link: "/admin/alerts",
            stat: 0,
            statLabel: "Active Alerts"
        }
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Manage users, subscriptions, and monitor platform activity
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4">Loading dashboard data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminCards.map((card, index) => (
                        <Link href={card.link} key={index}>
                            <Card className="h-full bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-blue-600/20 p-3 rounded-full">
                                            <card.icon className="h-6 w-6 text-blue-500" />
                                        </div>
                                        {card.stat !== null && (
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{card.stat}</p>
                                                <p className="text-xs text-gray-400">{card.statLabel}</p>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                                    <p className="text-gray-400">{card.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
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