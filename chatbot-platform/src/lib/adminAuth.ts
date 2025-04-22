// src/lib/adminAuth.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Updated to remove the unused req parameter and any type
export function withAdminAuth<T>(handler: () => Promise<T>) {
    return async () => {
        try {
            const session = await getServerSession(authOptions);

            if (!session || session.user?.role !== "admin") {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                );
            }

            // Just call the handler without passing any parameters
            return handler();
        } catch (error) {
            console.error("Auth error:", error);
            return NextResponse.json(
                { message: "Internal server error" },
                { status: 500 }
            );
        }
    };
}