// /app/api/chatbots/[id]/regenerate-api-key/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { pool } from "@/lib/db";
import crypto from "crypto";

export async function POST(
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
            // Verify ownership
            let query = "SELECT id, api_key FROM chatbots WHERE id = $1";
            const queryParams = [chatbotId];

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

            const oldApiKey = result.rows[0].api_key;

            // Generate a new API key
            const newApiKey = crypto.randomBytes(16).toString("hex");

            // Update the API key in the database
            await client.query(
                "UPDATE chatbots SET api_key = $1, updated_at = NOW() WHERE id = $2",
                [newApiKey, chatbotId]
            );

            // Return the new API key
            return NextResponse.json({
                message: "API key regenerated successfully",
                apiKey: newApiKey
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error regenerating API key:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}