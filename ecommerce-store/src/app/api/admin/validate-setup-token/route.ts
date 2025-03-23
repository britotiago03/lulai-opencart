// app/api/admin/validate-setup-token/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, error: "No token provided" }, { status: 400 });
        }

        // Check if the token exists in the verification_tokens table and is not expired
        const tokenResult = await pool.query(
            `SELECT vt.user_id, a.url_path, a.access_key
       FROM verification_tokens vt
       LEFT JOIN admin_users au ON vt.user_id = au.id
       LEFT JOIN admin_access_tokens a ON a.created_by = au.id AND a.is_active = true
       WHERE vt.token = $1
       AND vt.type = 'admin_setup'
       AND vt.expires_at > NOW()`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return NextResponse.json({ valid: false, error: "Invalid or expired token" });
        }

        // Construct full access URL if available
        let accessUrl = '';
        if (tokenResult.rows[0].url_path && tokenResult.rows[0].access_key) {
            accessUrl = `${tokenResult.rows[0].url_path}?key=${tokenResult.rows[0].access_key}`;
        }

        return NextResponse.json({
            valid: true,
            accessUrl
        });
    } catch (error) {
        console.error("Error validating admin setup token:", error);
        return NextResponse.json(
            { valid: false, error: "An error occurred while validating the token" },
            { status: 500 }
        );
    }
}