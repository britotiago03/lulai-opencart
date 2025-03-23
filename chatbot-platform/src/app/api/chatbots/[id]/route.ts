// chatbot-platform/src/app/api/chatbots/[id]/route.ts
import { NextResponse } from "next/server";
import { getChatbotById, updateChatbot, deleteChatbot } from "@/lib/chatbots/db";
import { chatbotSchema } from "@/lib/db/schema";

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const chatbot = await getChatbotById(context.params.id);
        if (!chatbot) {
            return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
        }
        return NextResponse.json(chatbot, { status: 200 });
    } catch (error) {
        console.error("Error fetching chatbot:", error);
        return NextResponse.json(
            { error: "Error fetching chatbot", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const body = await request.json();

        // Validate the request body against the schema
        const result = chatbotSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.format() },
                { status: 400 }
            );
        }

        // Ensure the chatbot exists before updating
        const existing = await getChatbotById(context.params.id);
        if (!existing) {
            return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
        }

        // Update the chatbot using the new updateChatbot function
        const updated = await updateChatbot(context.params.id, body);
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error updating chatbot:", error);
        return NextResponse.json(
            { error: "Error updating chatbot", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Ensure the chatbot exists before deletion
        const existing = await getChatbotById(params.id);
        if (!existing) {
            return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
        }

        // Delete the chatbot
        await deleteChatbot(params.id);
        return NextResponse.json({ message: "Chatbot deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting chatbot:", error);
        return NextResponse.json(
            { error: "Error deleting chatbot", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
