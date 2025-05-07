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

interface FixedPieChartProps {
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

const FixedPieChart: React.FC<FixedPieChartProps> = ({
    data,
    colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#6366f1']
}) => {
    // Format data for the pie chart
    const formattedData = data.map(item => ({
        name: formatIntentName(item.intent || 'unknown'),
        value: item.count
    }));

    // Calculate total value for percentages
    const total = formattedData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        paddingAngle={2}
                    >
                        {formattedData.map((_, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                                stroke="#1b2539"
                                strokeWidth={2}
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
                        formatter={(value, name) => [
                            `${value} (${((value / total) * 100).toFixed(1)}%)`, 
                            name
                        ]}
                    />
                    <Legend 
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FixedPieChart;