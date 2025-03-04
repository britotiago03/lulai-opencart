// src/app/api/chatbots/[id]/route.ts
import { NextResponse } from "next/server";
import { getChatbotById, updateChatbot, deleteChatbot } from "@/lib/chatbots/db";
import { chatbotSchema } from "@/lib/db/schema";

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const { params } = context;

        const chatbot = await getChatbotById(params.id);

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
        const { params } = context;
        const body = await request.json();

        // Validate request body against schema
        const result = chatbotSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: result.error.format() },
                { status: 400 }
            );
        }

        // Check if the chatbot exists
        const existing = await getChatbotById(params.id);
        if (!existing) {
            return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
        }

        // Update the chatbot
        const updated = await updateChatbot(params.id, body);
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error updating chatbot:", error);
        return NextResponse.json(
            { error: "Error updating chatbot", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const { params } = context;

        // Check if the chatbot exists
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