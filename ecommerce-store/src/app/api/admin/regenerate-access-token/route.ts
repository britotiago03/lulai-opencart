// app/api/admin/regenerate-access-token/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { userAuthOptions } from "@/lib/auth-config";
import pool from "@/lib/db";
import { updateAdminAccessToken } from "@/lib/adminSetup";
import { sendAdminAccessUpdateEmail } from "@/lib/emailService";

export async function POST() {
    try {
        // Check authentication and admin permission
        const session = await getServerSession(userAuthOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get frequency from settings
        const settingResult = await pool.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'access_token_renewal_frequency'"
        );

        const frequency = settingResult.rows.length > 0 ?
            settingResult.rows[0].setting_value as 'weekly' | 'monthly' : 'weekly';

        // Regenerate the token
        const newToken = await updateAdminAccessToken(
            Number(session.user.id),
            frequency
        );

        // Get all active admins to notify
        const adminsResult = await pool.query(
            "SELECT email, name FROM admin_users WHERE is_active = true"
        );

        // Send emails to all admins
        for (const admin of adminsResult.rows) {
            await sendAdminAccessUpdateEmail(
                admin.email,
                admin.name,
                newToken.path,
                newToken.key,
                newToken.expiresAt
            );
        }

        return NextResponse.json({
            success: true,
            message: "Access token regenerated successfully"
        });
    } catch (error) {
        console.error("Error regenerating access token:", error);
        return NextResponse.json(
            { error: "Error regenerating access token", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}