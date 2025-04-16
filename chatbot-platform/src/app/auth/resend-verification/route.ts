// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createVerificationToken, TOKEN_TYPES, deleteUserTokens } from "@/lib/tokenService";
import { sendVerificationEmail } from "@/lib/emailService";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Find the user
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            // Don't reveal that the user doesn't exist for security reasons
            return NextResponse.json({ message: "If your account exists, a verification email has been sent." });
        }

        const user = userResult.rows[0];

        // Check if already verified
        if (user.verified) {
            return NextResponse.json({ message: "Your email is already verified. Please login." });
        }

        // Delete any existing verification tokens for this user
        await deleteUserTokens(user.id, TOKEN_TYPES.EMAIL_VERIFICATION);

        // Create a new verification token
        const token = await createVerificationToken(user.id, TOKEN_TYPES.EMAIL_VERIFICATION);

        // Send the verification email
        await sendVerificationEmail(email, token, user.name);

        return NextResponse.json({
            message: "Verification email sent. Please check your inbox."
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}