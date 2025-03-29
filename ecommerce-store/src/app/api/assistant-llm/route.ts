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
        const { message, history, currentProductId, currentProductInfo } = await req.json();

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

        // Add current product context if available
        let currentProductContext = "";
        if (currentProductId && currentProductInfo) {
            currentProductContext = `
CURRENT PRODUCT:
The user is currently viewing this product:
ID: ${currentProductId}
Name: ${currentProductInfo.name || 'Unknown'}
Brand: ${currentProductInfo.brand || 'Unknown'}
Price: $${currentProductInfo.price?.toFixed(2) || 'Unknown'}
${currentProductInfo.description ? `Description: ${currentProductInfo.description}` : ''}

If the user asks to "add this to cart", "buy this", or similar phrases, they are referring to this product.
`;
        }

        // Craft system prompt with store context
        const systemPrompt = `You are a helpful shopping assistant for an e-commerce store. 
    
Store information:
${storeInfo}

Your task is to help users navigate the site, find products, and answer questions about shipping, returns, and other store policies.

IMPORTANT INFORMATION ABOUT PRODUCTS:
${productContext}

${currentProductContext}

When the user asks about a specific product, try to identify the exact product from the list of available products above, and navigate them directly to that product page using the product ID.

Always prioritize exact product matches over general searches when possible.

When users want to navigate to a specific page, you should include an action that specifies where they should go.

If the user wants to add the current product to their cart, update quantities, or remove items, use a cart action.

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "response": "Your helpful response to the user",
  "action": {
    // For navigation:
    "type": "navigate", 
    "path": "/path/to/navigate/to"
    
    // OR for search:
    "type": "search",
    "query": "search query"
    
    // OR for cart operations:
    "type": "cart",
    "operation": "add" or "remove" or "update",
    "productId": 123,
    "quantity": 1 (required for add/update operations)
    
    // OR undefined if no action needed
  }
}`;

        // Format conversation history for OpenAI
        const formattedHistory = history || [];

        try {
            // Query OpenAI with all context
            const parsedResponse = await queryOpenAI(systemPrompt, message, formattedHistory);

            // Validate action if present
            let validatedAction: Action | undefined = undefined;
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

            // Handle cart actions with current product context
            if (parsedResponse.action?.type === 'cart') {
                // If the user refers to the current product but no productId is specified
                if (!parsedResponse.action.productId && currentProductId) {
                    parsedResponse.action.productId = currentProductId;
                }

                // If we still don't have a valid productId, remove the action
                if (!parsedResponse.action.productId) {
                    parsedResponse.action = undefined;
                    parsedResponse.response += " I couldn't determine which product you're referring to. Please specify the product or navigate to a product page first.";
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