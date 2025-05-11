'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ChartDataItem {
    name: string;
    value: number;
}

interface IntentItem {
    intent: string;
    count: number;
}

interface SimplePieChartProps {
    data: IntentItem[];
    colors?: string[];
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({
    data,
    colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#6366f1']
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
                No data available
            </div>
        );
    }

    // Format data for the pie chart
    const formattedData: ChartDataItem[] = data.map(item => ({
        name: formatIntentName(item.intent || 'unknown'),
        value: item.count
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => {
                        // Custom label formatter: Show name and value for slices with significant value
                        // Only show name for larger segments to prevent overlap
                        const percent = Math.round((entry.value / data.reduce((sum, item) => sum + item.count, 0)) * 100);
                        return percent >= 10 ? entry.name : '';
                    }}
                    labelLine={{
                        stroke: '#8884d8',
                        strokeWidth: 1,
                    }}
                >
                    {formattedData.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f9fafb',
                        borderRadius: '4px',
                        padding: '8px'
                    }}
                    itemStyle={{ color: '#f9fafb' }}
                    labelStyle={{ color: '#f9fafb', fontWeight: 'bold', marginBottom: '5px' }}
                    formatter={(value, name) => [`${value} conversations`, name]}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Helper function to format intent names
function formatIntentName(name: string): string {
    let formattedName = name.replace(/_/g, ' ');
    
    switch (formattedName) {
        case 'cart_add': return 'Add to Cart';
        case 'product_view': return 'View Product';
        case 'navigate': return 'Navigation';
        case 'question': return 'Question';
        case 'other': return 'Other';
        default:
            return formattedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}

export default SimplePieChart;