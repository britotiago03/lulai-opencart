// src/app/api/admin/users/count/route.ts
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { pool } from "@/lib/db";

export const GET = withAdminAuth(async () => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT COUNT(*) FROM users");

        return NextResponse.json({
            count: parseInt(result.rows[0].count)
        });
    } catch (error) {
        console.error("Error fetching user count:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
});