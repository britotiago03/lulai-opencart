import { NextResponse, NextRequest } from "next/server";
import { validateApiKey } from "@/lib/apiKey.service";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // API Key validation for `/auth/admin/login`
    if (pathname === "/auth/admin/login") {
        const apiKey = req.nextUrl.searchParams.get("apiKey");

        if (!apiKey || !(await validateApiKey(apiKey))) {
            console.warn("Invalid or missing API key. Redirecting to 404.");
            return NextResponse.rewrite(new URL("/404", req.url)); // Redirect invalid API key users to 404
        }
        return NextResponse.next();
    }

    // Require authentication for all other protected routes
    if (!token) {
        console.warn("User not authenticated. Redirecting to /auth/signin.");
        return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/premium/:path*",
        "/auth/admin/:path*", // Protects all `/auth/admin/*` routes
        "/api/protected/:path*",
    ],
};
