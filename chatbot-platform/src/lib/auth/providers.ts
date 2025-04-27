// src/lib/auth/providers.ts
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { UserTypes } from "./types";
import { validateUserCredentials } from "./validation";

/**
 * Creates a credentials provider for a specific user type
 * @param id Provider ID
 * @param userType Type of user (client or admin)
 * @returns Configured credentials provider
 */
export function createCredentialsProvider(id: string, userType: string) {
    return CredentialsProvider({
        id,
        name: `${userType === UserTypes.ADMIN ? 'Admin' : 'User'} Credentials`,
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
    });
}

/**
 * Creates a Google authentication provider
 * @returns Configured Google provider
 */
export function createGoogleProvider() {
    return GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: UserTypes.CLIENT,
            };
        },
    });
}