// src/utils/analytics.ts
import {
    AnalyticsData,
    ChartDataPoint,
    LineChartDataPoint,
    BarChartDataPoint,
    PieChartDataPoint
} from '@/types/analytics';

/**
 * Formats intent distribution data for pie charts
 */
export function formatIntentDistribution(data: AnalyticsData): PieChartDataPoint[] {
    if (!data.intentDistribution || data.intentDistribution.length === 0) {
        return [];
    }

    return data.intentDistribution.map(item => ({
        name: formatIntentName(item.intent),
        value: parseInt(item.count)
    }));
}

/**
 * Formats recent activity data for line charts
 */
export function formatDailyActivity(data: AnalyticsData): LineChartDataPoint[] {
    const activityData = data.recentActivity || data.dailyStats || [];

    if (activityData.length === 0) {
        return [];
    }

    return activityData.map(item => ({
        date: formatDate(item.date),
        count: parseInt(item.count || item.conversation_count || 0),
        messages: parseInt(item.message_count || 0)
    }));
}

/**
 * Formats cart operations data for bar charts
 */
export function formatCartOperations(data: AnalyticsData): BarChartDataPoint[] {
    if (!data.cartOperations || data.cartOperations.length === 0) {
        return [];
    }

    return data.cartOperations.map(item => ({
        name: formatOperationName(item.operation),
        value: parseInt(item.count)
    }));
}

/**
 * Formats navigation actions data for bar charts
 */
export function formatNavigationActions(data: AnalyticsData): BarChartDataPoint[] {
    if (!data.navigationActions || data.navigationActions.length === 0) {
        return [];
    }

    return data.navigationActions.map(item => ({
        name: item.target || 'Unknown',
        value: parseInt(item.count)
    }));
}

/**
 * Format date strings to more readable format
 */
function formatDate(dateStr: string): string {
    if (!dateStr) return '';

    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format intent names to be more readable
 */
function formatIntentName(intent: string): string {
    if (!intent) return 'Unknown';

    // Replace underscores with spaces
    let formatted = intent.replace(/_/g, ' ');

    // Handle special cases
    switch(formatted) {
        case 'cart add':
            return 'Add to Cart';
        case 'product view':
            return 'View Product';
        case 'navigate':
            return 'Navigation';
        case 'question':
            return 'Question';
        case 'other':
            return 'Other';
        default:
            // Capitalize first letter of each word
            return formatted
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}

/**
 * Format operation names to be more readable
 */
function formatOperationName(operation: string): string {
    if (!operation) return 'Unknown';

    // Replace underscores with spaces
    let formatted = operation.replace(/_/g, ' ');

    // Handle special cases
    switch(formatted) {
        case 'add':
            return 'Add to Cart';
        case 'remove':
            return 'Remove from Cart';
        case 'update':
            return 'Update Cart';
        default:
            // Capitalize first letter of each word
            return formatted
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}

/**
 * Calculate percentage from a part and a total
 */
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return parseFloat(((part / total) * 100).toFixed(1));
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
}

/**
 * Format seconds to a readable time
 */
export function formatResponseTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}
