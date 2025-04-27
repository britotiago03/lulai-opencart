// src/components/dashboard/analytics/charts/BarChart.tsx
'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Define a type for data items
interface DataItem {
    [key: string]: string | number | Date | null;
}

interface BarChartProps {
    data: DataItem[];
    xDataKey: string;
    yDataKey: string;
    barSize?: number;
    barColor?: string;
}

const CustomBarChart: React.FC<BarChartProps> = ({
                                                     data,
                                                     xDataKey,
                                                     yDataKey,
                                                     barSize = 30,
                                                     barColor = '#3b82f6'
                                                 }) => {
    if (!data || data.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-gray-400">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
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
                />
                <Bar
                    dataKey={yDataKey}
                    fill={barColor}
                    barSize={barSize}
                    animationDuration={1500}
                    isAnimationActive={true}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CustomBarChart;