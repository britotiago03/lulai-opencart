import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession, isAdmin } from "./utils/sessionUtils";
import { getDbClient } from "./utils/dbUtils";
import { validateChatbotInput } from "./utils/validationUtils";
import { fetchChatbotByApiKey, fetchChatbots, createNewChatbot } from "./services/chatbotService";
import { ChatbotCreateInput } from "./types";

// GET: Retrieve all chatbots or chatbots for a specific user
export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const apiKey = searchParams.get('apiKey');

        const client = await getDbClient();

        try {
            // Case for fetching by API key
            if (apiKey) {
                // If not admin, need to verify ownership by passing userId
                const userId = !isAdmin(session) ? session.user.id : undefined;
                const chatbot = await fetchChatbotByApiKey(client, apiKey, userId);

                if (!chatbot) {
                    return NextResponse.json(
                        { message: "Chatbot not found or unauthorized" },
                        { status: 404 }
                    );
                }

                return NextResponse.json(chatbot);
            }

            // Default case: fetch all chatbots based on user role
            const chatbots = await fetchChatbots(
                client,
                isAdmin(session),
                session.user.id
            );

            return NextResponse.json(chatbots);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching chatbots:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST: Create a new chatbot
export async function POST(req: NextRequest) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotData: ChatbotCreateInput = await req.json();

        // Validate input
        const validation = validateChatbotInput(chatbotData);
        if (!validation.valid) {
            return NextResponse.json(
                { message: validation.message || "Invalid input" },
                { status: 400 }
            );
        }

        const client = await getDbClient();

        try {
            const result = await createNewChatbot(
                client,
                chatbotData,
                session.user.id
            );

            if (!result.success) {
                return NextResponse.json(
                    { message: result.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: "Chatbot created successfully",
                chatbot: result.chatbot
            }, { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Chatbot creation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}