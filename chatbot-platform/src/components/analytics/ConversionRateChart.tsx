// src/components/analytics/ConversionRateChart.tsx
"use client";

import {
    LineChart,
    Line,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ComposedChart,
    ResponsiveContainer,
} from 'recharts';
import { DailyMetric } from '@/lib/analytics/types';

interface ConversionRateChartProps {
    data: DailyMetric[];
}

export default function ConversionRateChart({ data }: ConversionRateChartProps) {
    // Format dates for better display in chart
    const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Conversions',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: 12 }
                        }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Rate (%)',
                            angle: 90,
                            position: 'insideRight',
                            style: { textAnchor: 'middle', fontSize: 12 }
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number, name: string) => {
                            return name === 'Conversion Rate' ? [`${value.toFixed(2)}%`, name] : [value, name];
                        }}
                    />
                    <Legend />
                    <Bar
                        yAxisId="left"
                        dataKey="conversionCount"
                        name="Conversions"
                        fill="#3b82f6"
                        barSize={20}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversionRate"
                        name="Conversion Rate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}