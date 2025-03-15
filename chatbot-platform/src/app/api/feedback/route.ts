// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logFeedback } from '@/lib/analytics/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messageId, rating, feedbackText } = body;

        if (!messageId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Invalid request. Required: messageId and rating (1-5)' },
                { status: 400 }
            );
        }

        const feedbackId = await logFeedback(messageId, rating, feedbackText);

        return NextResponse.json({
            success: true,
            feedbackId
        });
    } catch (error) {
        console.error('Error recording feedback:', error);
        return NextResponse.json(
            { error: 'Failed to record feedback' },
            { status: 500 }
        );
    }
}