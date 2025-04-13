// src/components/charts/LineChart.tsx
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

interface LineChartProps {
    data: any[];
    xDataKey: string;
    yDataKey: string;
    secondaryDataKey?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

const CustomLineChart: React.FC<LineChartProps> = ({
                                                       data,
                                                       xDataKey,
                                                       yDataKey,
                                                       secondaryDataKey,
                                                       primaryColor = '#3b82f6',
                                                       secondaryColor = '#8b5cf6'
                                                   }) => {
    if (!data || data.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-gray-400">No data available</div>;
    }

    // Format dates and ensure all data points have values
    const processedData = data.map(item => {
        // Convert date strings to formatted dates if needed
        let formattedDate = item[xDataKey];
        if (typeof formattedDate === 'string' && formattedDate.includes('-')) {
            try {
                const date = new Date(formattedDate);
                formattedDate = date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });
            } catch (e) {
                console.error('Error formatting date:', e);
            }
        }

        return {
            ...item,
            [xDataKey]: formattedDate,
            [yDataKey]: typeof item[yDataKey] === 'number' ? item[yDataKey] : 0,
            ...(secondaryDataKey && {
                [secondaryDataKey]: typeof item[secondaryDataKey] === 'number' ? item[secondaryDataKey] : 0
            })
        };
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={processedData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                    dataKey={xDataKey}
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
                    formatter={(value) => {
                        if (value === yDataKey) return 'Conversations';
                        if (value === secondaryDataKey) return 'Messages';
                        return value;
                    }}
                />
                <Line
                    type="monotone"
                    dataKey={yDataKey}
                    stroke={primaryColor}
                    strokeWidth={2}
                    dot={{ fill: primaryColor, r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                    isAnimationActive={true}
                    name={yDataKey === 'count' ? 'Conversations' : yDataKey}
                />
                {secondaryDataKey && (
                    <Line
                        type="monotone"
                        dataKey={secondaryDataKey}
                        stroke={secondaryColor}
                        strokeWidth={2}
                        dot={{ fill: secondaryColor, r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        isAnimationActive={true}
                        name={secondaryDataKey === 'messages' ? 'Messages' : secondaryDataKey}
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CustomLineChart;