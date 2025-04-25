// src/lib/auth/options.ts
import { NextAuthOptions } from "next-auth";
import { UserTypes } from "./types";
import { createCredentialsProvider, createGoogleProvider } from "./providers";
import { createAuthCallbacks } from "./callbacks";

/**
 * Creates authentication options for client users
 * @returns NextAuth options for client authentication
 */
export function createClientAuthOptions(): NextAuthOptions {
    return {
        providers: [
            createCredentialsProvider("user-credentials", UserTypes.CLIENT),
            createGoogleProvider(),
        ],
        callbacks: createAuthCallbacks(false),
        pages: {
            signIn: "/auth/signin",
        },
        session: {
            strategy: "jwt",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        },
        cookies: {
            sessionToken: {
                name: "user-session-token",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
        },
        secret: process.env.NEXTAUTH_SECRET,
    };
}

/**
 * Creates authentication options for admin users
 * @returns NextAuth options for admin authentication
 */
export function createAdminAuthOptions(): NextAuthOptions {
    return {
        providers: [
            createCredentialsProvider("admin-credentials", UserTypes.ADMIN),
        ],
        callbacks: createAuthCallbacks(true),
        pages: {
            signIn: "/admin/signin",
        },
        session: {
            strategy: "jwt",
            maxAge: 8 * 60 * 60, // 8 hours (shorter session for admins)
        },
        cookies: {
            sessionToken: {
                name: "admin-session-token",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
        },
        secret: process.env.NEXTAUTH_SECRET,
    };
}