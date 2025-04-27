// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatCards from "@/components/dashboard/StatCards";
import ChatbotSection from "@/components/dashboard/ChatbotSection";
import ConversationsSection from "@/components/dashboard/ConversationsSection";
import ErrorDisplay from "@/components/dashboard/ErrorDisplay";
import { Chatbot, Conversation, DashboardStats } from "@/types/dashboard";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalChatbots: 0,
        totalConversations: 0,
        conversionRate: 0,
        averageResponseTime: 0,
    });
    const { data: session, status } = useSession();
    const router = useRouter();

    // Fetch chatbots and statistics
    useEffect(() => {
        if(status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch chatbots
                const chatbotsResponse = await fetch("/api/chatbots");
                if (!chatbotsResponse.ok) {
                    // Handle the error without throwing
                    console.error("Failed to fetch chatbots:", chatbotsResponse.status);
                    setError("Failed to load your chatbots. Please try again.");
                    return; // Exit the function early
                }
                const chatbotsData = await chatbotsResponse.json();
                setChatbots(chatbotsData);

                // Fetch analytics
                if (chatbotsData.length > 0) {
                    const analyticsResponse = await fetch("/api/analytics");
                    if (analyticsResponse.ok) {
                        const analyticsData = await analyticsResponse.json();
                        setStats({
                            totalChatbots: chatbotsData.length,
                            totalConversations: analyticsData.totalConversations || 0,
                            conversionRate: analyticsData.conversionRate || 0,
                            averageResponseTime: analyticsData.averageResponseTime || 0,
                        });
                    }
                }

                // Fetch recent conversations
                const conversationsResponse = await fetch("/api/conversations?limit=5");
                if (conversationsResponse.ok) {
                    const conversationsData = await conversationsResponse.json();
                    setRecentConversations(conversationsData);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load your dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        // Call the async function and handle the returned promise
        // Using void operator to explicitly indicate we're ignoring the promise result
        void fetchData();
    }, [session, router, status]);

    // Loading
    if (loading) {
        return <LoadingSkeleton />;
    }

    // Error
    if (error) {
        return <ErrorDisplay error={error} />;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <DashboardHeader />
            <WelcomeCard userName={session?.user?.name || 'User'} hasChatbots={chatbots.length > 0} />
            <StatCards stats={stats} />
            <ChatbotSection chatbots={chatbots} />
            <ConversationsSection
                conversations={recentConversations}
                showEmptyState={chatbots.length > 0}
            />
        </div>
    );
}