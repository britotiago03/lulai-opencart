// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { verifyToken, deleteToken } from "@/lib/tokenService";

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        // Basic validation
        if (!token || !newPassword) {
            return NextResponse.json(
                { error: "Token and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Verify the token
        const tokenVerification = await verifyToken(token);

        if (!tokenVerification.valid || !tokenVerification.userId) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        const userId = tokenVerification.userId;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, userId]
        );

        // Delete the token after use
        await deleteToken(token);

        return NextResponse.json({
            success: true,
            message: "Your password has been reset successfully!"
        });
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}