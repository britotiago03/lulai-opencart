'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import type {
    ValueType,
    NameType
} from 'recharts/types/component/DefaultTooltipContent';

import type { TooltipProps } from 'recharts';

interface DataItem {
    [key: string]: string | number;
}

interface PieChartProps {
    data: DataItem[];
    dataKey: string;
    nameKey: string;
    colors?: string[];
    innerRadius?: number;
    outerRadius?: number;
    showLegend?: boolean;
}

const CustomPieChart: React.FC<PieChartProps> = ({
                                                     data,
                                                     dataKey,
                                                     nameKey,
                                                     colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#6366f1'],
                                                     innerRadius = 60,
                                                     outerRadius = 80,
                                                     showLegend = true
                                                 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
                No data available
            </div>
        );
    }

    const formattedData = data.map(item => {
        let formattedName = String(item[nameKey]);

        formattedName = formattedName.replace(/_/g, ' ');

        switch (formattedName) {
            case 'cart add': formattedName = 'Add to Cart'; break;
            case 'product view': formattedName = 'View Product'; break;
            case 'navigate': formattedName = 'Navigation'; break;
            case 'question': formattedName = 'Question'; break;
            case 'other': formattedName = 'Other'; break;
            default:
                formattedName = formattedName
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
        }

        return {
            ...item,
            [nameKey]: formattedName
        };
    });

    const customTooltip = ({
                               active,
                               payload
                           }: TooltipProps<ValueType, NameType>): React.ReactElement | null => {
        if (active && payload && payload.length) {
            const name = payload[0].name ?? "Unknown";
            const value = Number(payload[0].value ?? 0);
            const total = data.reduce((sum, item) => sum + Number(item[dataKey] || 0), 0);
            const percent = ((value / total) * 100).toFixed(1);

            return (
                <div className="bg-[#1f2937] border border-[#374151] p-3 rounded shadow">
                    <p className="font-medium">{name}</p>
                    <p className="text-[#d1d5db]">{`${value} (${percent}%)`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    fill="#8884d8"
                    dataKey={dataKey}
                    nameKey={nameKey}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    animationDuration={1500}
                    isAnimationActive={true}
                >
                    {formattedData.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                        />
                    ))}
                </Pie>
                <Tooltip content={customTooltip} />
                {showLegend && (
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ color: '#d1d5db' }}
                    />
                )}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomPieChart;
