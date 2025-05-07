'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface DataItem {
    date: string;
    count: number;
    messages?: number;
}

interface SimpleLineChartProps {
    data: DataItem[];
    primaryColor?: string;
    secondaryColor?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
    data,
    primaryColor = '#3b82f6',
    secondaryColor = '#8b5cf6'
}) => {
    if (!data || data.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-gray-400">No data available</div>;
    }

    // Format dates and ensure all data points have values
    const processedData = data.map(item => ({
        date: item.date,
        count: typeof item.count === 'number' ? item.count : 0,
        messages: typeof item.messages === 'number' ? item.messages : 0
    })).sort((a, b) => {
        // Try to parse as dates first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // If both are valid dates, compare them
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateA.getTime() - dateB.getTime();
        }
        
        // Otherwise, just compare as strings
        return a.date.localeCompare(b.date);
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={processedData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af' }}
                    tickLine={{ stroke: '#4b5563' }}
                    axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis
                    tick={{ fill: '#9ca3af' }}
                    tickLine={{ stroke: '#4b5563' }}
                    axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f9fafb'
                    }}
                    itemStyle={{ color: '#f9fafb' }}
                    labelStyle={{ color: '#f9fafb' }}
                />
                <Legend
                    wrapperStyle={{ color: '#d1d5db' }}
                />
                <Line
                    type="monotone"
                    dataKey="count"
                    name="Conversations"
                    stroke={primaryColor}
                    strokeWidth={2}
                    dot={{ fill: primaryColor, r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="messages"
                    name="Messages"
                    stroke={secondaryColor}
                    strokeWidth={2}
                    dot={{ fill: secondaryColor, r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SimpleLineChart;