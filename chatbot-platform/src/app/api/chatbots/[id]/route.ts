import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession, isAdmin } from "../utils/sessionUtils";
import { getDbClient } from "../utils/dbUtils";
import {
    fetchChatbotWithWidget,
    updateChatbotDetails,
    deleteChatbot
} from "./services/chatbotService";
import { ChatbotUpdateInput } from "./types";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const client = await getDbClient();

        try {
            const chatbotData = await fetchChatbotWithWidget(
                client,
                chatbotId,
                isAdmin(session),
                session.user.id
            );

            if (!chatbotData) {
                return NextResponse.json(
                    { message: "Chatbot not found or unauthorized" },
                    { status: 404 }
                );
            }

            return NextResponse.json(chatbotData);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching chatbot:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const updateData: ChatbotUpdateInput = await req.json();
        const client = await getDbClient();

        try {
            const result = await updateChatbotDetails(
                client,
                chatbotId,
                updateData,
                isAdmin(session),
                session.user.id
            );

            if (!result.success) {
                return NextResponse.json(
                    { message: result.message },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: "Chatbot updated successfully",
                chatbot: result.chatbot
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error updating chatbot:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const client = await getDbClient();

        try {
            const result = await deleteChatbot(
                client,
                chatbotId,
                isAdmin(session),
                session.user.id
            );

            if (!result.success) {
                return NextResponse.json(
                    { message: result.message },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: "Chatbot deleted successfully"
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error deleting chatbot:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}