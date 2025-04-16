// lib/auth-config.ts
import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/auth.service";
import { AdminCredentialsProvider } from "@/lib/admin-auth";
import { pool } from "@/lib/db"; // Adjust the path to your database module

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
            adminAuthOrigin?: boolean;
            role?: string; // Add the role property
        };
    }

    interface User {
        id: string;
        email: string;
        isSuperAdmin?: boolean;
        adminAuthOrigin?: boolean;
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
                        role: "user", // Add the required role property
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
        async redirect({ url, baseUrl }) {
            // Handle Google's callback URL
            if (url.includes('/api/auth/check-subscription')) {
              return `${baseUrl}/api/auth/check-subscription`;
            }
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
        async jwt({ token, user }) {
            if (user) {
              // Store all user data directly in token properties
              token.id = user.id;
              token.email = user.email;
              token.name = user.name;
              token.subscription = user.subscription || 'none';
              token.isAdmin = false;
              token.role = 'client';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
              // Access the same properties we set in jwt callback
              session.user.id = token.id as string;
              session.user.email = token.email as string;
              session.user.name = token.name as string;
              session.user.subscription = token.subscription as string;
              session.user.isAdmin = token.isAdmin as boolean;
              session.user.role = token.role as string;
            }
            return session;
        },
        // New signin callback to better control user creation
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
              try {
                // Check if user exists
                const existingUser = await pool.query(
                  'SELECT id, subscription_status FROM users WHERE email = $1',
                  [user.email]
                );
        
                if (existingUser.rows.length === 0) {
                  // Create new user with default subscription
                  await pool.query(
                    `INSERT INTO users 
                     (id, name, email, verified, auth_provider, subscription_status) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [user.id, user.name, user.email, true, 'google', 'none']
                  );
                }
                return true;
              } catch (error) {
                console.error('Google sign-in error:', error);
                return false;
              }
            }
            return true; // Allow credentials provider
          },
    },
    cookies: {
        sessionToken: {
            name: `user-session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 30 * 24 * 60 * 60, // 30 days to match session
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET, // Ensure this is set
    useSecureCookies: process.env.NODE_ENV === "production",
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
};

// Separate auth options for admin users
export const adminAuthOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours
    },
    providers: [
        AdminCredentialsProvider,
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign-in
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: true,
                    isSuperAdmin: user.isSuperAdmin,
                    adminAuthOrigin: true, // Force set
                    role: 'admin'
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    isAdmin: true,
                    isSuperAdmin: token.isSuperAdmin as boolean,
                    adminAuthOrigin: true, // Force set
                    role: 'admin'
                };
            }
            return session;
        }
    },
    cookies: {
        sessionToken: {
            name: `admin-session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        adminAuth: {
            name: `admin-auth`,
            options: {
                httpOnly: true,
                sameSite: "strict", // More restrictive than lax
                path: "/admin", // Only sent for admin routes
                secure: process.env.NODE_ENV === "production",
                maxAge: 8 * 60 * 60, // 8 hours to match session
            }
        }
    },
    pages: {
        signIn: "/auth/admin/login",
        error: "/auth/admin/login",
    },
};