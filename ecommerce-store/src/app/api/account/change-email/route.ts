// app/api/account/change-email/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import { checkUserPassword, isEmailTaken } from "@/lib/auth.service";
import { createVerificationToken, TOKEN_TYPES } from "@/lib/tokenService";
import { sendEmailChangeVerification } from "@/lib/emailService";

export async function POST(req: Request) {
    try {
        // Get current user from session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
        }

        const userId = session.user.id;
        const { newEmail, currentPassword } = await req.json();

        // Basic validation
        if (!newEmail || !currentPassword) {
            return NextResponse.json(
                { error: "New email and current password are required" },
                { status: 400 }
            );
        }

        // Check if new email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json(
                { error: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        // Check if the new email is the same as the current one
        if (newEmail === session.user.email) {
            return NextResponse.json(
                { error: "The new email is the same as your current email" },
                { status: 400 }
            );
        }

        // Check if new email is already taken
        const emailExists = await isEmailTaken(newEmail);
        if (emailExists) {
            return NextResponse.json(
                { error: "This email is already registered" },
                { status: 400 }
            );
        }

        // Verify current password
        const isPasswordValid = await checkUserPassword(userId, currentPassword);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Get username for the email
        const userResult = await pool.query(
            "SELECT name FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userName = userResult.rows[0].name;

        // Create a verification token for email change
        const token = await createVerificationToken(Number(userId), TOKEN_TYPES.EMAIL_CHANGE, newEmail);

        // Send verification email to the new address
        await sendEmailChangeVerification(newEmail, token, userName);

        return NextResponse.json({
            success: true,
            message: "Verification email has been sent to your new address. Please check your inbox and follow the instructions to complete the email change."
        });

    } catch (error) {
        console.error("Change email error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}