// lib/auth-config.ts
import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/auth.service";
import { AdminCredentialsProvider } from "@/lib/admin-auth";

// Extend the Session and User types to include custom properties
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string | undefined;
            subscription?: string | null;
            isAdmin: boolean;
            isSuperAdmin?: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        isSuperAdmin?: boolean;
    }
}

// Separate auth options for regular users
export const userAuthOptions: NextAuthOptions = {
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        // Google OAuth provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),

        // Regular user authentication only
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await verifyUser(credentials.email, credentials.password);
                    if (!user) return null;
                    
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        subscription: null,
                        isAdmin: false,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);

                    if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
                        throw new Error('EMAIL_NOT_VERIFIED');
                    }

                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.subscription = user.subscription || null;
                token.isAdmin = false; // Always false for user auth
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.subscription = typeof token.subscription === "string" ? token.subscription : null;
                session.user.isAdmin = false; // Always false for user auth
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
};

// Separate auth options for admin users
export const adminAuthOptions: NextAuthOptions = {
    session: {
        strategy: "jwt" as const,
        maxAge: 8 * 60 * 60, // 8 hours - shorter session for admins
    },
    providers: [
        // Admin authentication provider only
        AdminCredentialsProvider,
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.isAdmin = true; // Always true for admin auth
                token.isSuperAdmin = typeof user.isSuperAdmin === "boolean" ? user.isSuperAdmin : false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.isAdmin = true; // Always true for admin auth
                session.user.isSuperAdmin = typeof token.isSuperAdmin === "boolean" ? token.isSuperAdmin : false;
            }
            return session;
        },
    },
    cookies: {
        // Use different cookie names for admin session
        sessionToken: {
            name: `admin-session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    pages: {
        signIn: "/auth/admin/login", // Custom login page for admins
        error: "/auth/admin/login",
    },
};