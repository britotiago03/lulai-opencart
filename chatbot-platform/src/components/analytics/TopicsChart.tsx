// src/components/analytics/TopicsChart.tsx
"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { PopularTopic } from '@/lib/analytics/types';

interface TopicsChartProps {
    topics: PopularTopic[];
}

export default function TopicsChart({ topics }: TopicsChartProps) {
    // Limit to top 10 topics and sort by count
    const topTopics = [...topics]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(topic => ({
            name: topic.trigger.length > 15
                ? topic.trigger.substring(0, 15) + '...'
                : topic.trigger,
            fullName: topic.trigger, // Keep full name for tooltip
            count: topic.count,
        }));

    // Colors for bars
    const colors = [
        '#3b82f6', '#4f46e5', '#8b5cf6', '#d946ef', '#ec4899',
        '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308'
    ];

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={topTopics}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 80, // Increased left margin for longer topic names
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        width={100}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number, name: string, props: any) => {
                            return [value, props.payload.fullName];
                        }}
                        labelFormatter={() => "Occurrences"}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {topTopics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}