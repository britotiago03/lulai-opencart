import { NextRequest, NextResponse } from "next/server";
import {
    extractProductTerms,
    getStoreInfo,
    getProductContext,
    findProductIdByName,
    validateAndNormalizeAction
} from './utils';
import { queryOpenAI } from './services';
import { Action, UnvalidatedAction } from './types';

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: "Missing message parameter" },
                { status: 400 }
            );
        }

        // Get store information for context
        const storeInfo = await getStoreInfo();

        // Extract product-specific terms for better context
        const productTerms = extractProductTerms(message);

        // Get available products for better context
        const productContext = await getProductContext(productTerms);

        // Craft system prompt with store context
        const systemPrompt = `You are a helpful shopping assistant for an e-commerce store. 
    
Store information:
${storeInfo}

Your task is to help users navigate the site, find products, and answer questions about shipping, returns, and other store policies.

IMPORTANT INFORMATION ABOUT PRODUCTS:
${productContext}

When the user asks about a specific product, try to identify the exact product from the list of available products above, and navigate them directly to that product page using the product ID.

Always prioritize exact product matches over general searches when possible.

When users want to navigate to a specific page, you should include an action that specifies where they should go.

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "response": "Your helpful response to the user",
  "action": {
    "type": "navigate" or "search" or null,
    "path": "/path/to/navigate/to" (only for navigate type),
    "query": "search query" (only for search type)
  }
}`;

        // Format conversation history for OpenAI
        const formattedHistory = history || [];

        try {
            // Query OpenAI with all context
            const parsedResponse = await queryOpenAI(systemPrompt, message, formattedHistory);

            // Validate action if present
            let validatedAction: Action = null;
            if (parsedResponse.action) {
                validatedAction = validateAndNormalizeAction(parsedResponse.action);
                parsedResponse.action = validatedAction as UnvalidatedAction;
            }

            // Special handling for product navigation
            if (
                parsedResponse.action?.type === 'navigate' &&
                typeof parsedResponse.action.path === 'string' &&
                parsedResponse.action.path.includes('product/')
            ) {
                const pathParts = parsedResponse.action.path.split('product/');

                if (pathParts.length > 1) {
                    const productIdentifier = pathParts[1];

                    // Check if it's already a numeric ID
                    if (/^\d+$/.test(productIdentifier)) {
                        // It's already a numeric ID, leave it as is
                        console.log(`Product path already has numeric ID: ${productIdentifier}`);
                    } else {
                        // It's a name or slug, look up the ID
                        console.log(`Looking up product ID for: ${productIdentifier}`);
                        const productId = await findProductIdByName(productIdentifier);

                        if (productId) {
                            // Update path with real product ID
                            parsedResponse.action.path = `/product/${productId}`;
                        } else {
                            // Fall back to search if product not found
                            parsedResponse.action = {
                                type: 'navigate',
                                path: `/products?search=${encodeURIComponent(productIdentifier)}`
                            };

                            // Update response to reflect search instead of direct navigation
                            parsedResponse.response = `I couldn't find a specific product page for "${productIdentifier}", but I'll show you search results for it instead.`;
                        }
                    }
                }
            }

            return NextResponse.json(parsedResponse);
        } catch (error) {
            console.error("Error querying OpenAI:", error);
            return NextResponse.json(
                {
                    response: "I'm sorry, I encountered an error when processing your request. Please try again.",
                    error: error instanceof Error ? error.message : String(error)
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in assistant LLM API:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}