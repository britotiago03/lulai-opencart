// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { handleEmailVerification } from "@/lib/verifyEmailToken";
import { verifyToken, deleteToken } from "@/lib/tokenService";
import pool from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const type = searchParams.get("type") || "account"; // Default to "account" if not specified

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Log incoming verification request for debugging
    console.log(`Processing verification: token=${token?.substring(0, 10)}..., type=${type}`);

    try {
        // First, check if this is an email change token
        const tokenData = await verifyToken(token);

        // If token has newEmail property, this is an email change token
        if (tokenData.valid && tokenData.userId && tokenData.newEmail) {
            console.log(`Email change verification for user ${tokenData.userId} to ${tokenData.newEmail}`);

            // Update the user's email in the database
            await pool.query(
                "UPDATE users SET email = $1 WHERE id = $2",
                [tokenData.newEmail, tokenData.userId]
            );

            // Delete the token after use
            await deleteToken(token);

            console.log(`Email successfully updated for user ${tokenData.userId}`);

            return NextResponse.json({
                success: true,
                message: "Email address updated successfully"
            });
        }

        // Otherwise, handle regular account verification
        let updateField;
        if (type === "email") {
            updateField = "email_verified";
        } else if (type === "account") {
            updateField = "verified";
        } else {
            // Log invalid type for debugging
            console.error(`Invalid verification type: ${type}`);
            return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
        }

        const result = await handleEmailVerification(token, updateField);
        // Log successful verification
        if (result.success) {
            console.log(`Verification successful for type: ${type}`);
        }
        return NextResponse.json(result, { status: result.status || 200 });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "An error occurred during verification" },
            { status: 500 }
        );
    }
}