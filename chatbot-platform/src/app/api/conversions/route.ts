/* src/app/api/conversions/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { recordConversion } from '@/lib/analytics/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, value } = body;

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        await recordConversion(conversationId, value);

        return NextResponse.json({
            success: true,
            message: 'Conversion recorded successfully'
        });
    } catch (error) {
        console.error('Error recording conversion:', error);
        return NextResponse.json(
            { error: 'Failed to record conversion' },
            { status: 500 }
        );
    }
}

