// src/app/api/admin-auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(adminAuthOptions);
        
        return NextResponse.json(session ? {
            ...session,
            user: {
                ...session.user,
                isAdmin: session.user?.role === "admin"
            }
        } : null);
    } catch (error) {
        console.error("Error checking admin session:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}