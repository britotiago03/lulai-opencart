// src/app/api/chatbots/[id]/interact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatbotById } from '@/lib/chatbots/db';
import { matchUserInput, enhancedMatchUserInput, getAIResponse } from '@/lib/chatbots/matcher';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get the chatbot
        const chatbot = await getChatbotById(id);
        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            );
        }

        // Match the user input against chatbot responses
        const matchResult = matchUserInput(message, chatbot.responses);
        //const matchResult = enhancedMatchUserInput(message, chatbot.responses);

        if (matchResult.matched) {
            return NextResponse.json({
                response: matchResult.response,
                matched: true,
                isAI: matchResult.isAI
            });
        }

        // No match found, use OpenAI to generate a response
        const aiResponse = await getAIResponse(message, chatbot.industry, chatbot.name);

        return NextResponse.json({
            response: aiResponse,
            matched: false,
            isAI: true,
            isGeneralAI: true  // Flag to indicate this is a general AI response
        });

    } catch (error) {
        console.error('Error processing chatbot interaction:', error);
        return NextResponse.json(
            { error: 'Failed to process your message' },
            { status: 500 }
        );
    }
}