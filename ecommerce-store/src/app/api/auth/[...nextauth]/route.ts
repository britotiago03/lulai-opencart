// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/auth.service";
import { AdminCredentialsProvider } from "@/lib/admin-auth";

// Define auth options to use both in the API route and server components
export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        // Regular user authentication
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

                    // Return user object that conforms to the User type
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        subscription: null,
                        // Ensure these are string or null
                        subscription_status: user.subscription_status || null,
                        subscription_end_date: user.subscription_end_date instanceof Date
                            ? user.subscription_end_date.toISOString()
                            : user.subscription_end_date || null,
                        isAdmin: false,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);

                    // Handle email verification error
                    if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
                        throw new Error('EMAIL_NOT_VERIFIED');
                    }

                    return null;
                }
            },
        }),

        // Admin authentication provider
        AdminCredentialsProvider,
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
                token.isAdmin = user.isAdmin || false;
                token.isSuperAdmin = user.isSuperAdmin || false;
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
                session.user.isAdmin = token.isAdmin || false;
                session.user.isSuperAdmin = token.isSuperAdmin || false;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };