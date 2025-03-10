// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { handleEmailVerification } from "@/lib/verifyEmailToken";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const type = searchParams.get("type") || "account"; // Default to "account" if not specified

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Log incoming verification request for debugging
    console.log(`Processing verification: token=${token?.substring(0, 10)}..., type=${type}`);

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

    try {
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