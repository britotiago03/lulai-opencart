// src/app/api/chatbots/[id]/prompt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from "@/lib/db";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const client = await pool.connect();

        try {
            // Verify ownership if not admin
            if (session.user.role !== 'admin') {
                const ownerCheck = await client.query(
                    "SELECT id FROM chatbots WHERE id = $1 AND user_id = $2",
                    [chatbotId, session.user.id]
                );

                if (ownerCheck.rows.length === 0) {
                    return NextResponse.json(
                        { message: "Chatbot not found or unauthorized" },
                        { status: 404 }
                    );
                }
            }

            // Get the custom prompt
            const result = await client.query(
                "SELECT custom_prompt FROM chatbots WHERE id = $1",
                [chatbotId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { message: "Chatbot not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                customPrompt: result.rows[0].custom_prompt
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching custom prompt:", error);
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
        const session = await getServerSession(userAuthOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const { customPrompt } = await req.json();

        if (customPrompt === undefined) {
            return NextResponse.json(
                { message: "Custom prompt is required" },
                { status: 400 }
            );
        }

        console.log("Updating custom prompt for chatbot ID:", chatbotId);
        console.log("New prompt:", customPrompt);

        const client = await pool.connect();

        try {
            // Verify ownership
            let query = "SELECT id FROM chatbots WHERE id = $1";
            const queryParams = [chatbotId];

            // Add ownership check for non-admins
            if (session.user.role !== 'admin') {
                query += " AND user_id = $2";
                queryParams.push(session.user.id);
            }

            const result = await client.query(query, queryParams);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { message: "Chatbot not found or unauthorized" },
                    { status: 404 }
                );
            }

            // Update the custom prompt in the chatbots table
            await client.query(
                "UPDATE chatbots SET custom_prompt = $1, updated_at = NOW() WHERE id = $2",
                [customPrompt, chatbotId]
            );

            console.log("Custom prompt updated in database");

            return NextResponse.json({
                message: "Custom prompt updated successfully"
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error updating custom prompt:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}