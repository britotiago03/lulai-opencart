// app/api/admin/setup-password/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Validate password requirements
        if (password.length < 10) {
            return NextResponse.json(
                { error: "Password must be at least 10 characters long for admin accounts" },
                { status: 400 }
            );
        }

        // Start a transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get the token and validate it
            const tokenResult = await client.query(
                `SELECT vt.user_id
                 FROM verification_tokens vt
                 JOIN admin_users au ON vt.user_id = au.id
                 WHERE vt.token = $1
                 AND vt.type = 'admin_setup'
                 AND vt.expires_at > NOW()`,
                [token]
            );

            if (tokenResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
            }

            const userId = tokenResult.rows[0].user_id;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12); // Using higher cost factor for admin passwords

            // Update the admin user's password
            await client.query(
                "UPDATE admin_users SET password = $1 WHERE id = $2",
                [hashedPassword, userId]
            );

            // Mark the setup as completed
            await client.query(
                "UPDATE admin_settings SET setting_value = 'true', updated_by = $1 WHERE setting_key = 'setup_completed'",
                [userId]
            );

            // Delete the used token
            await client.query(
                "DELETE FROM verification_tokens WHERE token = $1",
                [token]
            );

            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: "Admin password set successfully"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error setting admin password:", error);
            return NextResponse.json(
                { error: "Failed to set admin password" },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in setup-password API:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}