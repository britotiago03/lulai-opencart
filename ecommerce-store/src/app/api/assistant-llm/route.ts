import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Define action types
type NavigationAction = {
    type: 'navigate';
    path: string;
};

type ProductSearchAction = {
    type: 'search';
    query: string;
};

type Action = NavigationAction | ProductSearchAction | null;

// Define a type for the unvalidated action object
interface UnvalidatedAction {
    type?: string;
    path?: string;
    query?: string;
    [key: string]: unknown;
}

// Define a product interface
interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    [key: string]: unknown;
}

// Define OpenAI types we need
type Role = "system" | "user" | "assistant";

interface Message {
    role: Role;
    content: string;
}

interface OpenAIRequest {
    model: string;
    messages: Message[];
    response_format?: { type: string };
}

interface OpenAIChoice {
    message: { content: string | null };
}

interface OpenAIResponse {
    choices: OpenAIChoice[];
}

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

        // Craft system prompt with store context
        const systemPrompt = `You are a helpful shopping assistant for an e-commerce store. 
    
Store information:
${storeInfo}

Your task is to help users navigate the site, find products, and answer questions about shipping, returns, and other store policies.

When users want to navigate to a specific page, you should include an action that specifies where they should go.

For product questions, check if we have products matching their request before suggesting a product page.

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

        // Get available products for better context
        const productContext = await getProductContext(message);

        // Prepare the OpenAI API request
        const openaiRequest: OpenAIRequest = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "system", content: `Available products information: ${productContext}` },
                ...formattedHistory,
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" }
        };

        // Make API call to OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(openaiRequest)
        });

        // Handle non-OK responses without throwing inside try/catch
        if (!response.ok) {
            console.error(`OpenAI API error: ${response.status}`);
            return NextResponse.json(
                {
                    response: "I'm sorry, I encountered an error when processing your request. Please try again.",
                    error: `API responded with status ${response.status}`
                },
                { status: 500 }
            );
        }

        const completion = await response.json() as OpenAIResponse;

        // Parse response
        const responseContent = completion.choices[0].message.content;
        const parsedResponse: { response: string; action?: UnvalidatedAction } = { response: "" };

        try {
            if (responseContent) {
                const jsonData = JSON.parse(responseContent);
                parsedResponse.response = jsonData.response || "I'm sorry, I encountered an error.";
                if (jsonData.action) {
                    parsedResponse.action = jsonData.action;
                }
            }
        } catch (error) {
            console.error("Error parsing OpenAI response as JSON:", error);
            parsedResponse.response = responseContent || "I'm sorry, I encountered an error processing your request.";
        }

        // Validate action if present
        let validatedAction: Action = null;
        if (parsedResponse.action) {
            validatedAction = validateAndNormalizeAction(parsedResponse.action);
            parsedResponse.action = validatedAction;
        }

        // Special handling for product navigation
        if (parsedResponse.action?.type === 'navigate' &&
            typeof parsedResponse.action.path === 'string' &&
            parsedResponse.action.path.includes('product/') &&
            !parsedResponse.action.path.match(/product\/\d+/)) {

            // Extract product name from path
            const pathParts = parsedResponse.action.path.split('product/');
            if (pathParts.length > 1) {
                const productName = pathParts[1];

                // Look up product ID
                const productId = await findProductIdByName(productName);

                if (productId) {
                    // Update path with real product ID
                    parsedResponse.action.path = `/product/${productId}`;
                } else {
                    // Fall back to search if product not found
                    parsedResponse.action = {
                        type: 'navigate',
                        path: `/products?search=${encodeURIComponent(productName)}`
                    };

                    // Update response to reflect search instead of direct navigation
                    parsedResponse.response = `I couldn't find a specific product page for "${productName}", but I'll show you search results for it instead.`;
                }
            }
        }

        return NextResponse.json(parsedResponse);

    } catch (error) {
        console.error("Error in assistant LLM API:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

/**
 * Get store information for context
 */
async function getStoreInfo(): Promise<string> {
    try {
        // Get categories
        const categoryResult = await pool.query(
            "SELECT DISTINCT category FROM products"
        );
        const categories = categoryResult.rows.map(row => row.category);

        // Get brands
        const brandResult = await pool.query(
            "SELECT DISTINCT brand FROM products"
        );
        const brands = brandResult.rows.map(row => row.brand);

        return `
This e-commerce store sells electronic products.

Available pages:
- Home page: /
- Products listing: /products
- Individual product pages: /product/{id}
- Shopping cart: /cart
- Account page: /account
- Login: /auth/login
- Sign up: /auth/signup

Product categories: ${categories.join(', ')}
Brands available: ${brands.join(', ')}

Store policies:
- Free shipping on orders over $50
- 30-day return policy
- 10% discount for first-time customers with code WELCOME10
`;
    } catch (error) {
        console.error("Error getting store info:", error);
        return "Electronic products e-commerce store with various categories and brands.";
    }
}

/**
 * Get product context based on user message
 */
async function getProductContext(message: string): Promise<string> {
    try {
        // Extract potential product terms
        const terms = message.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !['the', 'and', 'for', 'with', 'about', 'tell', 'show', 'what'].includes(word));

        if (terms.length === 0) return "No specific product context available.";

        // Build search query
        const params = terms.map(term => `%${term}%`);
        const placeholders = params.map((_, i) => `$${i + 1}`).join(" OR name ILIKE ");

        const query = `
      SELECT id, name, brand, category, price 
      FROM products 
      WHERE name ILIKE ${placeholders}
      OR description ILIKE ${placeholders}
      OR category ILIKE ${placeholders}
      LIMIT 10
    `;

        // Run query with all params repeated for each condition
        const result = await pool.query(query, [...params, ...params, ...params]);

        if (result.rows.length === 0) {
            return "No matching products found.";
        }

        // Format product information
        return result.rows.map((product: Product) =>
            `ID: ${product.id}, Name: ${product.name}, Brand: ${product.brand}, Category: ${product.category}, Price: $${product.price}`
        ).join('\n');

    } catch (error) {
        console.error("Error getting product context:", error);
        return "Error retrieving product context.";
    }
}

/**
 * Find product ID by name
 */
async function findProductIdByName(productName: string): Promise<number | null> {
    try {
        // Clean up product name
        const searchTerm = productName.toLowerCase().trim();

        // Search for the product
        const result = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) LIKE $1 ORDER BY id LIMIT 1",
            [`%${searchTerm}%`]
        );

        if (result.rows.length > 0) {
            return result.rows[0].id;
        }

        return null;
    } catch (error) {
        console.error("Error finding product by name:", error);
        return null;
    }
}

/**
 * Validate and normalize action object
 */
function validateAndNormalizeAction(action: UnvalidatedAction): Action {
    if (!action || typeof action !== 'object') {
        return null;
    }

    if (action.type === 'navigate' && typeof action.path === 'string') {
        // Ensure path starts with /
        const path = action.path.startsWith('/') ? action.path : `/${action.path}`;
        return { type: 'navigate', path };
    }

    if (action.type === 'search' && typeof action.query === 'string') {
        return { type: 'search', query: action.query };
    }

    return null;
}