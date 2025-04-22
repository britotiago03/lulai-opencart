// src/components/admin-dashboard/analytics/ChartSection.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Define the expected props for the chart components
interface LineChartProps {
    data: Array<{ date: string; count: number }>;
    xDataKey: string;
    yDataKey: string;
    primaryColor: string;
}

interface PieChartProps {
    data: Array<{ name: string; value: number }>;
    dataKey: string;
    nameKey: string;
    colors: string[];
}

interface ChartSectionProps {
    analyticsData: {
        recentActivity?: Array<{ date: string; count: string }>;
        intentDistribution?: Array<{ intent: string; count: string }>;
    };
    LineChart: React.ComponentType<LineChartProps>;
    PieChart: React.ComponentType<PieChartProps>;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
                                                              analyticsData,
                                                              LineChart,
                                                              PieChart
                                                          }) => {
    // Format data for the line chart
    const formatActivityData = () => {
        if (!analyticsData.recentActivity || analyticsData.recentActivity.length === 0) {
            return [];
        }

        return analyticsData.recentActivity.map(day => ({
            date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: parseInt(day.count)
        }));
    };

    // Format data for the pie chart
    const formatIntentData = () => {
        if (!analyticsData.intentDistribution || analyticsData.intentDistribution.length === 0) {
            return [];
        }

        return analyticsData.intentDistribution.map(item => ({
            name: item.intent || 'unknown',
            value: parseInt(item.count)
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activity Chart */}
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold">Conversation Activity</h3>
                    </div>
                    <div className="h-80 w-full">
                        {formatActivityData().length > 0 ? (
                            <LineChart
                                data={formatActivityData()}
                                xDataKey="date"
                                yDataKey="count"
                                primaryColor="#3b82f6"
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No activity data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Intent Distribution Chart */}
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Intent Distribution</h3>
                    <div className="h-80 w-full">
                        {formatIntentData().length > 0 ? (
                            <PieChart
                                data={formatIntentData()}
                                dataKey="value"
                                nameKey="name"
                                colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No intent data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
