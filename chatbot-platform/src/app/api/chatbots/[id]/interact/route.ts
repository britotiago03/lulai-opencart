// src/app/api/chatbots/[id]/interact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatbotById } from '@/lib/chatbots/db';
import { matchUserInput, getAIResponse } from '@/lib/chatbots/matcher';
import { logConversation, logMessage } from '@/lib/analytics/db';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const { message, sessionId, visitorId, sourceUrl, platform } = await request.json();

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

        // Log the conversation and message
        let conversationId;

        // If sessionId is provided, use it to track the conversation
        if (sessionId) {
            // Get or create conversation
            conversationId = await logConversation({
                chatbotId: id,
                sessionId,
                visitorId,
                sourceUrl,
                platform
            });

            // Log user message
            await logMessage({
                conversationId,
                isFromUser: true,
                messageText: message,
                responseId: null,
                isAiGenerated: false,
                matchedTriggers: null,
                confidenceScore: null
            });
        }

        let response;
        let isAI = false;
        let isGeneralAI = false;
        let responseId: string | null = null;
        let matchedTriggers: string[] | null = null;
        let confidenceScore: number | null = null;

        if (matchResult.matched) {
            response = matchResult.response;
            isAI = matchResult.isAI || false;

            // If we have a direct match, get the response ID and matched triggers
            if (matchResult.responseId) {
                responseId = matchResult.responseId;
                matchedTriggers = matchResult.matchedTriggers || [];
                confidenceScore = matchResult.confidenceScore || null;
            }
        } else {
            // No match found, use OpenAI to generate a response
            response = await getAIResponse(message, chatbot.industry, chatbot.name);
            isAI = true;
            isGeneralAI = true;
        }

        // Log the bot response if we're tracking this conversation
        if (sessionId && conversationId) {
            await logMessage({
                conversationId,
                isFromUser: false,
                messageText: response,
                responseId,
                isAiGenerated: isGeneralAI,
                matchedTriggers,
                confidenceScore: confidenceScore
            });
        }

        return NextResponse.json({
            response,
            matched: matchResult.matched,
            isAI,
            isGeneralAI,
            conversationId
        });

    } catch (error) {
        console.error('Error processing chatbot interaction:', error);
        return NextResponse.json(
            { error: 'Failed to process your message' },
            { status: 500 }
        );
    }
}