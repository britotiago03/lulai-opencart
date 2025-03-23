// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth-config";
import pool from "@/lib/db";

// GET /api/admin/settings - Get admin settings
export async function GET() {
    try {
        // Check authentication and admin permission
        const session = await getServerSession(adminAuthOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch settings
        const result = await pool.query(
            "SELECT setting_key, setting_value FROM admin_settings"
        );

        // Convert to a key-value object
        const settings = result.rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        return NextResponse.json(
            { error: "Error fetching settings", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST /api/admin/settings - Update admin settings
export async function POST(req: Request) {
    try {
        // Check authentication and admin permission
        const session = await getServerSession(adminAuthOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For changing admin_email, require super admin privileges
        const settings = await req.json();
        if (settings.admin_email && !session.user.isSuperAdmin) {
            return NextResponse.json(
                { error: "Only super admins can change the primary admin email" },
                { status: 403 }
            );
        }

        // Validate frequency setting
        if (settings.access_token_renewal_frequency &&
            !['weekly', 'monthly'].includes(settings.access_token_renewal_frequency)) {
            return NextResponse.json(
                { error: "Invalid renewal frequency. Must be 'weekly' or 'monthly'" },
                { status: 400 }
            );
        }

        // Update settings
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const [key, value] of Object.entries(settings)) {
                // Check if the setting exists
                const checkResult = await client.query(
                    "SELECT 1 FROM admin_settings WHERE setting_key = $1",
                    [key]
                );

                if (checkResult.rows.length > 0) {
                    // Update existing setting
                    await client.query(
                        "UPDATE admin_settings SET setting_value = $1, updated_at = NOW(), updated_by = $2 WHERE setting_key = $3",
                        [value, session.user.id, key]
                    );
                } else {
                    // Insert new setting
                    await client.query(
                        "INSERT INTO admin_settings (setting_key, setting_value, updated_by) VALUES ($1, $2, $3)",
                        [key, value, session.user.id]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Transaction error:", error);
            return NextResponse.json(
                { error: "Database transaction failed", details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        } finally {
            client.release();
        }

        return NextResponse.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating admin settings:", error);
        return NextResponse.json(
            { error: "Error updating settings", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}