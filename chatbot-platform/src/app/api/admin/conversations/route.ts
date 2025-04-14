// src/app/api/admin/conversations/route.ts:
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await pool.connect();
        try {
            // Get all recent conversations, join with chatbots to get names
            const result = await client.query(`
        SELECT c.*, cb.name as chatbot_name 
        FROM conversations c
        LEFT JOIN chatbots cb ON c.api_key = cb.api_key
        ORDER BY c.created_at DESC
        LIMIT 100
      `);

            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}