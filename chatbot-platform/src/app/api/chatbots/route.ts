// chatbot-platform/src/app/api/chatbots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createChatbot, getChatbots } from '@/lib/chatbots/db';

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
    try {
        const body = await request.json();

        // Store chatbot in PostgreSQL
        const chatbot = await createChatbot({
            name: body.storeName, // Match integration form
            industry: body.industry,
            apiUrl: body.productApiUrl, 
            platform: body.platform,  // New field
            apiKey: body.apiKey || null,  // Optional API Key
            customPrompt: body.customPrompt || null,  // Custom system prompt
        });

        return NextResponse.json(chatbot, { status: 201 });
    } catch (error) {
        console.error("Chatbot creation failed:", error);
        return NextResponse.json({ error: "Failed to create chatbot" }, { status: 500 });
    }
}
