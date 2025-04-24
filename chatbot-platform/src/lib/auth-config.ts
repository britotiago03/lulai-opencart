// lib/auth-config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

// Define the user types
const UserTypes = {
    CLIENT: 'client',
    ADMIN: 'admin'
};

// Create reusable credential validation function
async function validateUserCredentials(email: string, password: string, userType: string) {
    if (!email || !password) {
        return null;
    }

    try {
        const client = await pool.connect();
        try {
            console.log(`Validating ${userType} credentials for ${email}`);

            const result = await client.query(
                "SELECT * FROM users WHERE email = $1 AND role = $2",
                [email, userType]
            );

            const user = result.rows[0];

            if (!user) {
                console.log(`No ${userType} found with email ${email}`);
                return null;
            }

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                console.log(`Password mismatch for ${email}`);
                return null;
            }

            console.log(`Successfully authenticated ${userType}: ${email}`);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: userType === UserTypes.ADMIN
            };
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(`${userType} authentication error:`, error);
        return null;
    }
}

// Create a function to generate auth options
function createAuthOptions(config: {
    userType: string;
    providerId: string;
    providerName: string;
    signInPage: string;
    isAdmin: boolean;
    sessionMaxAge: number;
    cookieName: string;
}): NextAuthOptions {
    const { userType, providerId, providerName, signInPage, isAdmin, sessionMaxAge, cookieName } = config;

    return {
        providers: [
            CredentialsProvider({
                id: providerId,
                name: providerName,
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    return validateUserCredentials(
                        credentials.email,
                        credentials.password,
                        userType
                    );
                },
            }),
        ],
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token.id = user.id;
                    token.role = user.role;
                    token.isAdmin = isAdmin;
                }
                return token;
            },
            async session({ session, token }) {
                if (token && session.user) {
                    session.user.id = token.id as string;
                    session.user.role = token.role as string;
                    session.user.isAdmin = isAdmin;
                }
                return session;
            },
        },
        pages: {
            signIn: signInPage,
        },
        session: {
            strategy: "jwt",
            maxAge: sessionMaxAge,
        },
        cookies: {
            sessionToken: {
                name: cookieName,
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

// Regular user authentication options
export const userAuthOptions = createAuthOptions({
    userType: UserTypes.CLIENT,
    providerId: "user-credentials",
    providerName: "User Credentials",
    signInPage: "/auth/signin",
    isAdmin: false,
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    cookieName: "user-session-token",
});

// Admin authentication options
export const adminAuthOptions = createAuthOptions({
    userType: UserTypes.ADMIN,
    providerId: "admin-credentials",
    providerName: "Admin Credentials",
    signInPage: "/admin/signin",
    isAdmin: true,
    sessionMaxAge: 8 * 60 * 60, // 8 hours (shorter session for admins)
    cookieName: "admin-session-token",
});