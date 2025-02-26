// src/app/api/ai/enhance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { enhanceResponse } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { trigger, response, industry } = body;

        if (!trigger || !response || !industry) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const enhancedResponse = await enhanceResponse(trigger, response, industry);

        return NextResponse.json({ enhancedResponse });
    } catch (error) {
        console.error('Error in AI enhancement endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to enhance response' },
            { status: 500 }
        );
    }
}