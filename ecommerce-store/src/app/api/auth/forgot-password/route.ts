// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createVerificationToken } from "@/lib/tokenService";
import { sendPasswordResetEmail } from "@/lib/emailService";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // Basic validation
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        // Check if the user exists
        const userResult = await pool.query(
            "SELECT id, name, verified FROM users WHERE email = $1",
            [email]
        );

        // Don't reveal if the user exists or not for security reasons
        // Instead, always return a success message
        if (userResult.rows.length === 0 || !userResult.rows[0].verified) {
            // If user doesn't exist or is not verified, still return success but don't send email
            return NextResponse.json({
                message: "If your email is registered and verified, you will receive a password reset link."
            });
        }

        const userId = userResult.rows[0].id;
        const userName = userResult.rows[0].name;

        // Create a password reset token
        const token = await createVerificationToken(userId, "password_reset");

        // Send the password reset email
        await sendPasswordResetEmail(email, token, userName);

        return NextResponse.json({
            message: "If your email is registered and verified, you will receive a password reset link."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}