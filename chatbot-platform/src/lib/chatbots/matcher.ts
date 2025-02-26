// src/lib/chatbots/matcher.ts
import { ChatbotResponse } from '@/lib/db/schema';
import { enhanceResponse, getGeneralResponse } from "@/lib/ai/openai";

interface MatchResult {
    matched: boolean;
    response?: string;
    isAI?: boolean;
}

/**
 * Match user input against chatbot responses using keyword matching
 */
export function matchUserInput(userInput: string, responses: ChatbotResponse[]): MatchResult {
    // Convert input to lowercase for case-insensitive matching
    const inputLower = userInput.toLowerCase().trim();

    // First try exact matches on trigger phrases
    for (const response of responses) {
        if (inputLower === response.trigger.toLowerCase()) {
            return {
                matched: true,
                response: response.response,
                isAI: response.isAI
            };
        }
    }

    // Then look for keywords within the input
    for (const response of responses) {
        // Split trigger into keywords
        const keywords = response.trigger
            .toLowerCase()
            .split(/\s+/)
            .filter(keyword => keyword.length > 2); // Only use keywords with more than 2 characters

        // Check if any of the keywords are in the user input
        if (keywords.some(keyword => inputLower.includes(keyword))) {
            return {
                matched: true,
                response: response.response,
                isAI: response.isAI
            };
        }
    }

    // No match found
    return { matched: false };
}

/**
 * Get a response from OpenAI for general questions
 */
export async function getAIResponse(userInput: string, industry: string, chatbotName?: string): Promise<string> {
    try {
        return await getGeneralResponse(userInput, industry, chatbotName);
    } catch (error) {
        console.error('Error getting AI response:', error);
        return "I'm sorry, I couldn't process your request at the moment. How else can I assist you?";
    }
}

/**
 * Enhanced matcher that considers intent detection
 */
export function enhancedMatchUserInput(userInput: string, responses: ChatbotResponse[]): MatchResult {
    const inputLower = userInput.toLowerCase().trim();

    // Detect the intent (new order vs order status)
    const isNewOrderIntent = inputLower.includes('can i order') ||
        inputLower.includes('want to order') ||
        inputLower.includes('place an order') ||
        inputLower.includes('make an order') ||
        inputLower.includes('order for tomorrow') ||
        (inputLower.includes('order') && inputLower.includes('tomorrow'));

    const isOrderStatusIntent = inputLower.includes('where is my order') ||
        inputLower.includes('order status') ||
        inputLower.includes('track') ||
        (inputLower.includes('order') && inputLower.includes('placed'));

    // Try to match based on intent first
    if (isNewOrderIntent) {
        // Look for responses specifically about placing orders
        for (const response of responses) {
            if (response.trigger.toLowerCase().includes('place order') ||
                response.trigger.toLowerCase().includes('make order') ||
                response.trigger.toLowerCase().includes('new order')) {
                return {
                    matched: true,
                    response: response.response,
                    isAI: response.isAI
                };
            }
        }
    }

    if (isOrderStatusIntent) {
        // Look for responses specifically about order status
        for (const response of responses) {
            if (response.trigger.toLowerCase().includes('order status') ||
                response.trigger.toLowerCase().includes('where is my order')) {
                return {
                    matched: true,
                    response: response.response,
                    isAI: response.isAI
                };
            }
        }
    }

    // Fall back to the original matching logic if intent-based matching fails
    return matchUserInput(userInput, responses);
}