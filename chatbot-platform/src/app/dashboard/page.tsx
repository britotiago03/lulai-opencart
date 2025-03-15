// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DeployedAgents from '@/components/dashboard/DeployedAgents';
import QuickAnalytics from '@/components/dashboard/QuickAnalytics';
import TopCustomers from '@/components/dashboard/TopCustomers';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [chatbots, setChatbots] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch available chatbots
    useEffect(() => {
        const fetchChatbots = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/chatbots');
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbots');
                }
                const data = await response.json();
                setChatbots(data);
            } catch (error) {
                console.error('Error fetching chatbots:', error);
                setError('Failed to load chatbots. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">Loading dashboard data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/dashboard/chatbots"
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm sm:text-base"
                    >
                        All Chatbots
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        Analytics
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Create New Agent Card */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-[#1b2539] text-white">
                    <CardContent className="p-4 sm:p-6">
                        <Link href="/dashboard/chatbots/create" className="flex items-center">
                            <div className="bg-blue-600/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold">Create New Agent</h2>
                                <p className="text-gray-400 text-sm sm:text-base">Build and deploy a new chatbot for your website</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Deployed Agents Section */}
                <DeployedAgents chatbots={chatbots} />

                {/* Quick Analytics Section */}
                <QuickAnalytics chatbots={chatbots} />

                {/* Top Customers Section */}
                <TopCustomers />
            </div>
        </div>
    );
}