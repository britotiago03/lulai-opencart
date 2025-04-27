// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export const GET = withAdminAuth(async () => {
    const client = await pool.connect();
    try {
        // Get all users with their chatbot counts
        const result = await client.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(c.id) as chatbot_count,
             MAX(c.updated_at) as last_active
      FROM users u
      LEFT JOIN chatbots c ON u.id = c.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

        // Format the data to match the expected structure
        const formattedUsers = result.rows.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            chatbotCount: parseInt(user.chatbot_count) || 0,
            lastActive: user.last_active || user.created_at
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});