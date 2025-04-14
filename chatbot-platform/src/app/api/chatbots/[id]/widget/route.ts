// src/app/api/chatbots/[id]/widget/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { pool } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

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

            // Get the widget configuration
            const result = await client.query(
                "SELECT * FROM widget_configs WHERE chatbot_id = $1",
                [chatbotId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { message: "Widget configuration not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching widget configuration:", error);
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
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const { widgetConfig } = await req.json();

        // Debug logs to verify what's being received
        console.log("Received widget config update:", widgetConfig);
        console.log("For chatbot ID:", chatbotId);

        // Validate the widget configuration
        if (!widgetConfig) {
            return NextResponse.json(
                { message: "Widget configuration is required" },
                { status: 400 }
            );
        }

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

            // Update the widget configuration
            await client.query(
                `UPDATE widget_configs 
                 SET primary_color = $1, 
                     secondary_color = $2, 
                     button_size = $3, 
                     window_width = $4, 
                     window_height = $5, 
                     header_text = $6, 
                     font_family = $7,
                     updated_at = NOW()
                 WHERE chatbot_id = $8`,
                [
                    widgetConfig.primaryColor || '#007bff',
                    widgetConfig.secondaryColor || '#e0f7fa',
                    parseInt(widgetConfig.buttonSize) || 60,
                    parseInt(widgetConfig.windowWidth) || 360,
                    parseInt(widgetConfig.windowHeight) || 500,
                    widgetConfig.headerText || 'Chat with us',
                    widgetConfig.fontFamily || 'Helvetica Neue, Helvetica, Arial, sans-serif',
                    chatbotId
                ]
            );

            console.log("Widget config updated in database");

            return NextResponse.json({
                message: "Widget configuration updated successfully"
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error updating widget configuration:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}