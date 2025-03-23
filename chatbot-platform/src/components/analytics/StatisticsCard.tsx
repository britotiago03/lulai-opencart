// src/components/analytics/StatisticsCard.tsx
"use client";

import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    MessageSquare, // Changed from MessageCircle to match your usage
    ShoppingCart,
    Star,
    Zap,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock
} from 'lucide-react';

// Update the icon type to match what you're actually passing from AnalyticsDashboard
type IconName = 'message-square' | 'shopping-cart' | 'star' | 'zap' | 'activity' | 'clock' | ReactNode;


interface StatisticsCardProps {
    title: string;
    value: string | number;
    icon?: IconName | ReactNode;
    description?: string;
    trend?: number; // Percentage change from previous period
    trendLabel?: string; // Label for trend (e.g., "vs. last week")
    trendReversed?: boolean; // If true, negative trends are good (e.g., for error rates)
    maxValue?: number; // For values with a known maximum (e.g., 5-star rating)
}

export default function StatisticsCard({
                                           title,
                                           value,
                                           icon,
                                           description,
                                           trend,
                                           trendLabel = "vs. previous period",
                                           trendReversed = false,
                                           maxValue,
                                       }: StatisticsCardProps) {

    // Determine if the icon is a ReactNode or a string name
    const isReactNodeIcon = typeof icon !== 'string';

    // Select the appropriate icon component if it's a string name
    let IconComponent = null;
    if (!isReactNodeIcon && typeof icon === 'string') {
        IconComponent = {
            'message-square': MessageSquare,
            'shopping-cart': ShoppingCart,
            'star': Star,
            'zap': Zap,
            'activity': Activity,
            'clock': Clock
        }[icon as string];
    }

    // Determine trend classes (color)
    let trendColor = 'text-gray-500';
    if (trend !== undefined) {
        const isPositive = trendReversed ? trend < 0 : trend > 0;
        trendColor = isPositive ? 'text-green-500' : trend === 0 ? 'text-gray-500' : 'text-red-500';
    }

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-sm text-gray-400">{title}</h3>
                        <p className="text-2xl font-bold mt-1">
                            {value}
                            {maxValue && typeof value === 'number' && (
                                <span className="text-sm text-gray-400 ml-1">/ {maxValue}</span>
                            )}
                        </p>
                        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                    </div>

                    {/* Render the icon based on its type */}
                    {icon && (
                        <div className="bg-blue-600/20 p-3 rounded-full">
                            {isReactNodeIcon ? (
                                // If it's a ReactNode, render it directly
                                icon
                            ) : IconComponent ? (
                                // If it's a string and we found a matching component
                                React.createElement(IconComponent, { className: "h-6 w-6 text-blue-500" })
                            ) : null}
                        </div>
                    )}
                </div>

                {trend !== undefined && (
                    <div className={`flex items-center mt-2 ${trendColor}`}>
                        {trend > 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                        ) : trend < 0 ? (
                            <TrendingDown className="w-4 h-4 mr-1" />
                        ) : (
                            <span className="w-4 h-4 mr-1">―</span>
                        )}
                        <p className="text-xs">
                            {trend > 0 && '+'}
                            {Math.abs(trend).toFixed(1)}% {trendLabel}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}