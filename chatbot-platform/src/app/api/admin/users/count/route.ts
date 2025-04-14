// src/app/api/admin/users/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
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
            const result = await client.query("SELECT COUNT(*) FROM users");

            return NextResponse.json({
                count: parseInt(result.rows[0].count)
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching user count:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}