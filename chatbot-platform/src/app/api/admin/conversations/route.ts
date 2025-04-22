// src/app/api/admin/conversations/route.ts
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export const GET = withAdminAuth(async () => {
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
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});