// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const client = await pool.connect();
                    try {
                        console.log("Attempting login for:", credentials.email);

                        // Use parameterized queries for security
                        const result = await client.query(
                            "SELECT * FROM users WHERE email = $1",
                            [credentials.email.toLowerCase().trim()]
                        );

                        const user = result.rows[0];

                        if (!user) {
                            console.log("User not found");
                            return null;
                        }

                        console.log("Found user:", user.email, "with role:", user.role);
                        console.log("Stored password hash:", user.password);

                        // Compare the provided password with the stored hash
                        const passwordMatch = await bcrypt.compare(
                            credentials.password,
                            user.password
                        );

                        console.log("Password match result:", passwordMatch);

                        if (!passwordMatch) {
                            return null;
                        }

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    } finally {
                        client.release();
                    }
                } catch (error) {
                    console.error("Database error during authentication:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };