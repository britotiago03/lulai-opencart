// src/components/dashboard/QuickAnalytics.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

interface QuickAnalyticsProps {
    chatbots: any[];
}

export default function QuickAnalytics({ chatbots }: QuickAnalyticsProps) {
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            // Only fetch if we have chatbots
            if (chatbots.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Get the first chatbot's ID to fetch its analytics
                const chatbotId = chatbots[0].id;

                // Get date range for last 7 days
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const response = await fetch(
                    `/api/analytics/${chatbotId}?startDate=${startDate}&endDate=${endDate}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const data = await response.json();
                setAnalyticsData(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [chatbots]);

    return (
        <Card className="bg-[#1b2539] text-white border-0">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>Quick Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Visitors Location Map */}
                    <Card className="bg-[#232b3c] text-white border-0">
                        <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm sm:text-base">Visitors Location</CardTitle>
                            <button>
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4">
                            <div className="h-32 sm:h-40 w-full relative bg-[#1d2434] rounded">
                                {/* Placeholder for world map visualization */}
                                <div className="absolute inset-0 opacity-30">
                                    <svg viewBox="0 0 800 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M156,203c6.9-4.4,22.1-9.7,27-16c5.2-6.8,7.8-16.3,14-22c7.8-7,17.4-4.3,26-11c4.9-3.8,7.1-9.8,12-14c4.3-3.7,9.4-5.8,15-8c4.5-1.8,8.7-3.9,13-6c4.3-2.1,10.3-1.5,15-3c4.3-1.4,8.1-4.1,12-6c5.4-2.6,11.1-4.1,17-7c5.9-2.9,12.5-7.8,19-10c7.3-2.5,14.8-2.7,22-4c7.4-1.3,15.9-1.7,24-2c8.2-0.3,14.8,0.5,22,1c7.2,0.5,16,0.5,24,1c7,0.4,13,0.6,20,1c7,0.4,14.9,0.6,22,1c8.3,0.5,16.2,1.5,24,2c9.2,0.6,17.9,0.1,26-1c8.7-1.2,19.3-5.5,29-7c9.7-1.5,17.5-0.5,26,0c9.1,0.5,19.4,0.5,29,1c8.9,0.5,16.1,2.5,24,4c7.7,1.5,17,5.3,26,8c8.6,2.6,15.2,6.3,22,10c7.7,4.2,17.4,8.9,27,13c9.1,3.9,18.9,7.9,29,12c8.5,3.5,18.9,5.8,27,9c7.1,2.8,13.2,6.8,20,10c5.7,2.7,10.7,5.5,16,8c4.8,2.2,9.7,4.3,15,6c4.4,1.4,8.8,2.4,13,4c3.9,1.5,8.3,3.7,11,6" strokeDasharray="8,8" fill="none" stroke="#fff" strokeWidth="0.5"></path>
                                        <circle cx="156" cy="203" r="5" fill="#fff"></circle>
                                        <circle cx="414" cy="88" r="5" fill="#fff"></circle>
                                        <circle cx="457" cy="234" r="5" fill="#fff"></circle>
                                        <circle cx="321" cy="155" r="5" fill="#fff"></circle>
                                        <circle cx="600" cy="203" r="3" fill="#fff"></circle>
                                        <circle cx="233" cy="323" r="3" fill="#fff"></circle>
                                        <circle cx="367" cy="278" r="3" fill="#fff"></circle>
                                        <circle cx="500" cy="345" r="3" fill="#fff"></circle>
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Replies Distribution */}
                    <Card className="bg-[#232b3c] text-white border-0">
                        <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm sm:text-base">Replies</CardTitle>
                            <button>
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4">
                            <div className="relative h-32 sm:h-40 flex items-center justify-center">
                                {/* Responsive pie chart */}
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
                                    <svg viewBox="0 0 200 200" className="w-full h-full">
                                        <circle cx="100" cy="100" r="80" fill="#444" />
                                        <path d="M100,100 L100,20 A80,80 0 0,1 180,100 Z" fill="#000000" />
                                        <path d="M100,100 L180,100 A80,80 0 0,1 100,180 Z" fill="#333333" />
                                        <path d="M100,100 L100,180 A80,80 0 0,1 20,100 Z" fill="#666666" />
                                        <path d="M100,100 L20,100 A80,80 0 0,1 100,20 Z" fill="#999999" />
                                    </svg>
                                </div>

                                {/* Legend - show to the right on larger screens, below on mobile */}
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs hidden md:block space-y-2">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
                                        <span>Segment A</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-gray-800 rounded-full mr-2"></span>
                                        <span>Segment B</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
                                        <span>Segment C</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                                        <span>Segment D</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile legend */}
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs md:hidden">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-black rounded-full mr-1"></span>
                                    <span>Segment A</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-gray-800 rounded-full mr-1"></span>
                                    <span>Segment B</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-gray-600 rounded-full mr-1"></span>
                                    <span>Segment C</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                                    <span>Segment D</span>
                                </div>
                            </div>

                            {/* Comparison stats */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-6">
                                <div>
                                    <p className="text-xs text-gray-400">Last week</p>
                                    <p className="text-sm sm:text-base font-bold">$1,890.6</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">This week</p>
                                    <p className="text-sm sm:text-base font-bold">$1,276.3</p>
                                    <p className="text-xs text-red-500">↓ 8%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}