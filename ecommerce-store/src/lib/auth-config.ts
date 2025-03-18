// lib/auth-config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/auth.service";
import { AdminCredentialsProvider } from "@/lib/admin-auth";

// Separate auth options for regular users
export const userAuthOptions: NextAuthOptions = {
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
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
                        subscription_status: user.subscription_status || null,
                        subscription_end_date: user.subscription_end_date instanceof Date
                            ? user.subscription_end_date.toISOString()
                            : user.subscription_end_date || null,
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
                token.subscription_status = user.subscription_status || null;
                token.subscription_end_date = user.subscription_end_date || null;
                token.isAdmin = false; // Always false for user auth
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.subscription = token.subscription || null;
                session.user.subscription_status = token.subscription_status || null;
                session.user.subscription_end_date = token.subscription_end_date || null;
                session.user.isAdmin = false; // Always false for user auth
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
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
                token.isSuperAdmin = user.isSuperAdmin || false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.isAdmin = true; // Always true for admin auth
                session.user.isSuperAdmin = token.isSuperAdmin || false;
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
        signIn: "/admin/login", // Custom login page for admins
        error: "/admin/login",
    },
};