// chatbot-platform/src/app/api/chatbots/%5Bid%5D/interact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatbotById } from '@/lib/chatbots/db';
import { getAIResponse } from '@/lib/chatbots/matcher';
import { logConversation, logMessage } from '@/lib/analytics/db';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const { message, sessionId, visitorId, sourceUrl, platform } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Retrieve the chatbot using its id
        const chatbot = await getChatbotById(id);
        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
        }

        // Generate AI response using the chatbot's data
        const response = await getAIResponse(message, chatbot.industry, chatbot.name);

        let conversationId: string | undefined = undefined;
        if (sessionId) {
            // Create or retrieve a conversation for the given session
            conversationId = await logConversation({
                chatbotId: id,
                sessionId,
                visitorId,
                sourceUrl,
                platform,
            });

            // Log the user message
            await logMessage({
                conversationId,
                isFromUser: true,
                messageText: message,
            });

            // Log the AI-generated response
            await logMessage({
                conversationId,
                isFromUser: false,
                messageText: response,
                isAiGenerated: true,
            });
        }

        return NextResponse.json({
            response,
            conversationId,
        });

    } catch (error) {
        console.error('Error processing chatbot interaction:', error);
        return NextResponse.json({ error: 'Failed to process your message' }, { status: 500 });
    }
}
