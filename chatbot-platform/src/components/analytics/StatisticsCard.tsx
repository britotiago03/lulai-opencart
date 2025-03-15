// src/components/analytics/StatisticsCard.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    MessageCircle, ShoppingCart, Star, Zap,
    TrendingUp, TrendingDown, Activity
} from 'lucide-react';

type IconName = 'message-circle' | 'shopping-cart' | 'star' | 'zap' | 'activity';

interface StatisticsCardProps {
    title: string;
    value: string | number;
    icon: IconName;
    trend?: number; // Percentage change from previous period
    trendLabel?: string; // Label for trend (e.g., "vs. last week")
    invertTrend?: boolean; // If true, negative trends are good (e.g., for error rates)
    maxValue?: number; // For values with a known maximum (e.g., 5-star rating)
}

export default function StatisticsCard({
                                           title,
                                           value,
                                           icon,
                                           trend,
                                           trendLabel = "vs. previous period",
                                           invertTrend = false,
                                           maxValue,
                                       }: StatisticsCardProps) {
    // Select the appropriate icon component
    const IconComponent = {
        'message-circle': MessageCircle,
        'shopping-cart': ShoppingCart,
        'star': Star,
        'zap': Zap,
        'activity': Activity,
    }[icon];

    // Determine trend classes (color)
    let trendColor = 'text-gray-500';
    if (trend) {
        const isPositive = invertTrend ? trend < 0 : trend > 0;
        trendColor = isPositive ? 'text-green-500' : trend === 0 ? 'text-gray-500' : 'text-red-500';
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                        <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex items-baseline">
                        <p className="text-2xl font-semibold">
                            {value}
                            {maxValue && typeof value === 'number' && (
                                <span className="text-sm text-gray-500 ml-1">/ {maxValue}</span>
                            )}
                        </p>
                    </div>

                    {trend !== undefined && (
                        <div className="flex items-center mt-2">
                            {trend > 0 ? (
                                <TrendingUp className={`w-4 h-4 mr-1 ${trendColor}`} />
                            ) : trend < 0 ? (
                                <TrendingDown className={`w-4 h-4 mr-1 ${trendColor}`} />
                            ) : (
                                <span className="w-4 h-4 mr-1">―</span>
                            )}
                            <p className={`text-xs ${trendColor}`}>
                                {trend > 0 && '+'}
                                {trend}% {trendLabel}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}