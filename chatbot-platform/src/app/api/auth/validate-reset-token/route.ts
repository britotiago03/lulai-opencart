// app/api/auth/validate-reset-token/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/tokenService";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        // Verify the token
        const tokenVerification = await verifyToken(token);

        // Check if the token is valid and it's a password reset token type
        return NextResponse.json({
            valid: tokenVerification.valid
        });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            { valid: false, error: "An error occurred while validating the token" },
            { status: 500 }
        );
    }
}