// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Find user by email
                    const result = await pool.query(
                        'SELECT * FROM users WHERE email = $1',
                        [credentials.email]
                    );

                    const user = result.rows[0];

                    if (!user) {
                        console.log('User not found');
                        return null;
                    }

                    // Verify password
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        console.log('Invalid password');
                        return null;
                    }

                    // Return user data (excluding password)
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
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
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-should-be-changed-in-production',
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };