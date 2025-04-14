// src/app/api/chatbots/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
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
            // Query to get chatbot data
            let query = "SELECT * FROM chatbots WHERE id = $1";
            const queryParams = [chatbotId];

            // If not admin, verify ownership
            if (session.user.role !== "admin") {
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

            // Get associated widget config
            const widgetResult = await client.query(
                "SELECT * FROM widget_configs WHERE chatbot_id = $1",
                [chatbotId]
            );

            // Combine data
            const chatbotData = {
                ...result.rows[0],
                widget: widgetResult.rows.length > 0 ? widgetResult.rows[0] : null
            };

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
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatbotId = params.id;
        const { name, description } = await req.json();

        const client = await pool.connect();

        try {
            // Verify ownership first
            let ownershipQuery = "SELECT * FROM chatbots WHERE id = $1";
            const queryParams = [chatbotId];

            if (session.user.role !== "admin") {
                ownershipQuery += " AND user_id = $2";
                queryParams.push(session.user.id);
            }

            const checkResult = await client.query(ownershipQuery, queryParams);

            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { message: "Chatbot not found or unauthorized" },
                    { status: 404 }
                );
            }

            // Update chatbot
            const updateResult = await client.query(
                `UPDATE chatbots 
         SET name = $1, 
            description = $2,
            updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
                [name, description, chatbotId]
            );

            return NextResponse.json({
                message: "Chatbot updated successfully",
                chatbot: updateResult.rows[0]
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
            // Start transaction
            await client.query('BEGIN');

            // Verify ownership first
            let ownershipQuery = "SELECT api_key FROM chatbots WHERE id = $1";
            const queryParams = [chatbotId];

            if (session.user.role !== "admin") {
                ownershipQuery += " AND user_id = $2";
                queryParams.push(session.user.id);
            }

            const checkResult = await client.query(ownershipQuery, queryParams);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { message: "Chatbot not found or unauthorized" },
                    { status: 404 }
                );
            }

            const apiKey = checkResult.rows[0].api_key;

            // Delete related records
            await client.query("DELETE FROM widget_configs WHERE chatbot_id = $1", [chatbotId]);
            await client.query("DELETE FROM analytics WHERE chatbot_id = $1", [chatbotId]);

            // Delete main chatbot record
            await client.query("DELETE FROM chatbots WHERE id = $1", [chatbotId]);

            // Commit the transaction
            await client.query('COMMIT');

            return NextResponse.json({
                message: "Chatbot deleted successfully"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
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