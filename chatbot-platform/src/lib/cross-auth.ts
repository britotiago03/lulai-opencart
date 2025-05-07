// src/lib/cross-auth.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions, adminAuthOptions } from "@/lib/auth-config";

/**
 * Middleware that checks both admin and user authentication
 * Allows admins to access endpoints that are normally only available to users
 * @param handler The request handler to execute if authentication passes
 * @returns 
 */
export function withCrossAuth(handler: (req: NextRequest, session: any) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            // First try user session
            let session = await getServerSession(userAuthOptions);
            
            // If no user session found, try admin session
            if (!session) {
                const adminSession = await getServerSession(adminAuthOptions);
                
                // If admin session found, create a proxy session with user role data
                if (adminSession && adminSession.user?.role === "admin") {
                    session = {
                        ...adminSession,
                        // Add a flag to indicate this is an admin accessing user endpoints
                        isAdminCrossAccess: true
                    };
                }
            }
            
            // Still no valid session?
            if (!session) {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                );
            }
            
            // Call the handler with the session
            return handler(req, session);
        } catch (error) {
            console.error("Cross-auth error:", error);
            return NextResponse.json(
                { message: "Internal server error" },
                { status: 500 }
            );
        }
    };
}