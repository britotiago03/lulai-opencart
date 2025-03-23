import NextAuth, { User, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/auth.service";
import GoogleProvider from "next-auth/providers/google";

interface Subscription {
    plan_type: string;
    status: string;
    current_period_end: string;
}

interface CustomUser extends User {
    id: string;
    email: string;
    name: string;
    subscription: Subscription | null; // 🔧 Fixed type
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        // Google OAuth provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        
        // Other credentials provider
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<CustomUser | null> {
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
                        subscription: null, // 🔧 Ensure type matches Subscription | null
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
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
                token.subscription = user.subscription || null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.subscription = null;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

// Correct export for Next.js 13+
export const GET = handler;
export const POST = handler;
