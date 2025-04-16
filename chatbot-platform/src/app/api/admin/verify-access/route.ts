// app/api/admin/verify-access/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { accessKey, path } = await req.json();

        if (!accessKey || !path) {
            return NextResponse.json({ error: "Invalid access attempt" }, { status: 400 });
        }

        // Clean the path to just get the base part without query parameters
        const cleanPath = path.split("?")[0];

        // Check if the access token exists and is valid
        const result = await pool.query(
            `SELECT * FROM admin_access_tokens 
            WHERE url_path = $1
            AND access_key = $2
            AND expires_at > NOW()
            AND is_active = true`,
            [cleanPath, accessKey]
        );

        if (result.rows.length === 0) {
            // Don't provide specific error details for security
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Update last used timestamp
        await pool.query(
            "UPDATE admin_access_tokens SET last_used_at = NOW() WHERE id = $1",
            [result.rows[0].id]
        );

        return NextResponse.json({ verified: true });
    } catch (error) {
        console.error("Error verifying admin access:", error);
        return NextResponse.json({ error: "Access verification failed" }, { status: 500 });
    }
}