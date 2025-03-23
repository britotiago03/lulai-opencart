// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createVerificationToken } from "@/lib/tokenService";
import { sendAdminSetupEmail } from "@/lib/emailService";
import { updateAdminAccessToken } from "@/lib/adminSetup";
import { validateAdminAccess } from "@/lib/admin-utils";

// GET /api/admin/users - Get all admin users
export async function GET() {
    try {
        // Validate admin access - we don't need the session for this route
        const { errorResponse } = await validateAdminAccess();
        if (errorResponse) return errorResponse;

        // Fetch all admin users
        const result = await pool.query(
            `SELECT id, name, email, is_super_admin, is_active, created_at, last_login
       FROM admin_users
       ORDER BY is_super_admin DESC, name ASC`
        );

        return NextResponse.json({ users: result.rows });
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json(
            { error: "Error fetching admin users", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST /api/admin/users - Create a new admin user
export async function POST(req: Request) {
    try {
        // Validate super admin access
        const { session, errorResponse } = await validateAdminAccess(true);
        if (errorResponse) return errorResponse;

        // Ensure session is not null
        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        const { name, email, is_super_admin } = await req.json();

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required fields" },
                { status: 400 }
            );
        }

        // Check if email is already in use
        const emailCheck = await pool.query(
            "SELECT 1 FROM admin_users WHERE email = $1",
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return NextResponse.json(
                { error: "An admin with this email already exists" },
                { status: 400 }
            );
        }

        // Create new admin user
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insert new admin user without password (will be set via email)
            const result = await client.query(
                `INSERT INTO admin_users (name, email, is_super_admin, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING id, name, email, is_super_admin, is_active, created_at, last_login`,
                [name, email, is_super_admin || false]
            );

            const newAdminId = result.rows[0].id;

            // Create a setup token for password setting
            const setupToken = await createVerificationToken(
                newAdminId,
                'admin_setup',
                undefined,
                client
            );

            // Get current active access token
            const accessTokenResult = await client.query(
                `SELECT url_path, access_key
         FROM admin_access_tokens 
         WHERE is_active = true 
         ORDER BY created_at DESC 
         LIMIT 1`
            );

            // Initialize access path and key variables
            let accessPath;
            let accessKey;

            if (accessTokenResult.rows.length > 0) {
                accessPath = accessTokenResult.rows[0].url_path;
                accessKey = accessTokenResult.rows[0].access_key;
            } else {
                // If no active token exists, create one
                const currentAdminId = Number(session.user.id);
                const newToken = await updateAdminAccessToken(currentAdminId);
                accessPath = newToken.path;
                accessKey = newToken.key;
            }

            await client.query('COMMIT');

            // Send setup email
            await sendAdminSetupEmail(
                email,
                name,
                setupToken,
                accessPath,
                accessKey
            );

            return NextResponse.json({
                success: true,
                user: result.rows[0],
                message: "Admin user created successfully"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error creating admin user:", error);
            return NextResponse.json(
                { error: "Error creating admin user", details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error creating admin user:", error);
        return NextResponse.json(
            { error: "Error creating admin user", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}