/* src/app/api/chatbots/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { createChatbot, getChatbots } from '@/lib/chatbots/db';
import { chatbotSchema } from '@/lib/db/schema';

export async function GET() {
    try {
        const chatbots = await getChatbots();
        return NextResponse.json(chatbots);
    } catch (error) {
        console.error('Error fetching chatbots:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chatbots' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log("POST /api/chatbots received");
    try {
        const body = await request.json();

        // Validate request body against schema
        const result = chatbotSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.format() },
                { status: 400 }
            );
        }

        //const chatbot = await createChatbot(result.data);
        const chatbot = await createChatbot(body);
        return NextResponse.json(chatbot, { status: 201 });
    } catch (error) {
        console.error('Error creating chatbot:', error);
        return NextResponse.json(
            { error: 'Failed to create chatbot' },
            { status: 500 }
        );
    }
}