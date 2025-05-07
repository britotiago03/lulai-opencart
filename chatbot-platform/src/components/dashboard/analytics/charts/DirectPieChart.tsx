'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface IntentItem {
    intent: string;
    count: number;
}

interface DirectPieChartProps {
    data: IntentItem[];
    colors?: string[];
}

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

const DirectPieChart: React.FC<DirectPieChartProps> = ({
    data,
    colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']
}) => {
    // Format data for the pie chart
    const formattedData = data.map(item => ({
        name: formatIntentName(item.intent || 'unknown'),
        value: item.count
    }));

    // Calculate total for percentage
    const total = formattedData.reduce((sum, item) => sum + item.value, 0);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {formattedData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={colors[index % colors.length]} 
                        />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value) => [`${value} (${((Number(value) / total) * 100).toFixed(1)}%)`, '']}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default DirectPieChart;