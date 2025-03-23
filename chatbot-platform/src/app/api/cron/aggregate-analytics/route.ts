// src/app/api/cron/aggregate-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aggregateDailyAnalytics } from '@/lib/analytics/db';

// This endpoint is meant to be called by a cron job
export async function GET(request: NextRequest) {
    try {
        // Validate the request has the correct secret key
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET_KEY;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the date to process, default to yesterday
        const dateParam = request.nextUrl.searchParams.get('date');
        const date = dateParam || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Aggregate analytics for the specified date
        await aggregateDailyAnalytics(date);

        return NextResponse.json({
            success: true,
            message: `Analytics aggregated for ${date}`
        });
    } catch (error) {
        console.error('Error aggregating analytics:', error);
        return NextResponse.json(
            { error: 'Failed to aggregate analytics' },
            { status: 500 }
        );
    }
}