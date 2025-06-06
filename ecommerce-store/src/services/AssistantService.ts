'use client';

import { Message } from '@/types/assistant';

/**
 * Service for managing AI assistant communications
 * Using OpenAI for high-quality intent recognition and contextual understanding
 */
export default class AssistantService {
    // Store conversation history to provide context to the LLM
    private conversationHistory: { role: 'user' | 'assistant', content: string }[] = [];

    // Store the current product ID if the user is on a product page
    private currentProductId: number | null = null;
    private currentProductInfo: Record<string, unknown> | null = null;

    /**
     * Set the current product context when on product pages
     */
    public setCurrentProduct(productId: number, productInfo: Record<string, unknown>): void {
        this.currentProductId = productId;
        this.currentProductInfo = productInfo;
    }

    /**
     * Clear the current product context
     */
    public clearCurrentProduct(): void {
        this.currentProductId = null;
        this.currentProductInfo = null;
    }

    /**
     * Process a user query using OpenAI's API for intent classification
     * and response generation
     *
     * @param text - The user's query text
     * @returns Object containing AI response, navigation info, and cart action if needed
     */
    public async processUserQuery(text: string): Promise<{
        aiResponse: string;
        shouldNavigate: boolean;
        navigationPath: string;
        cartAction?: {
            operation: 'add' | 'remove' | 'update';
            productId: number;
            quantity?: number;
        };
    }> {
        // Add user message to conversation history
        this.conversationHistory.push({ role: 'user', content: text });

        // Limit history to last 10 messages to keep context window manageable
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }

        try {
            // Include current product context in the request
            const response = await fetch('/api/assistant-llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: this.conversationHistory,
                    currentProductId: this.currentProductId,
                    currentProductInfo: this.currentProductInfo
                })
            });

            if (!response.ok) {
                console.error(`API error: ${response.status}`);
                return this.handleFailure();
            }

            const data = await response.json();

            // Add assistant response to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: data.response
            });

            // Default return object
            const result = {
                aiResponse: data.response,
                shouldNavigate: false,
                navigationPath: ''
            };

            // Check for actions
            if (data.action) {
                // Handle navigation action
                if (data.action.type === 'navigate') {
                    result.shouldNavigate = true;
                    result.navigationPath = data.action.path;
                }

                // Handle cart action
                else if (data.action.type === 'cart') {
                    return {
                        ...result,
                        cartAction: {
                            operation: data.action.operation,
                            productId: data.action.productId,
                            quantity: data.action.quantity
                        }
                    };
                }
            }

            return result;
        } catch (error) {
            console.error('Error processing user query:', error);
            return this.handleFailure();
        }
    }

    /**
     * Handle error cases
     */
    private handleFailure(): {
        aiResponse: string;
        shouldNavigate: boolean;
        navigationPath: string;
    } {
        return {
            aiResponse: "I'm sorry, I encountered an error processing your request. Please try again.",
            shouldNavigate: false,
            navigationPath: ''
        };
    }

    /**
     * Generate a default welcome message
     *
     * @returns A welcome message object
     */
    public getWelcomeMessage(): Message {
        // Add welcome message to conversation history for context
        this.conversationHistory = [{
            role: 'assistant',
            content: "Hello! I'm your shopping assistant. I can help you browse products, find deals, and navigate the store. How can I help you today?"
        }];

        return {
            role: 'assistant',
            content: "Hello! I'm your shopping assistant. I can help you browse products, find deals, and navigate the store. How can I help you today?",
            timestamp: new Date()
        };
    }
}