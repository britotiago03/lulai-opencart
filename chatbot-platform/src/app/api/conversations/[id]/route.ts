// src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConversationDetail } from '@/lib/analytics/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const conversationId = params.id;

        if (!conversationId) {
            return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }

        const conversation = await getConversationDetail(conversationId);

        if (!conversation) {
            console.error(`Conversation with ID ${conversationId} not found`);
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation details' },
            { status: 500 }
        );
    }
}