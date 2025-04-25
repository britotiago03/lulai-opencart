// src/lib/auth/callbacks.ts
import type { CallbacksOptions } from "next-auth";
import { UserTypes } from "./types";
import { handleGoogleSignIn } from "./google";

/**
 * Creates the set of callbacks for a specific authentication configuration
 * @param isAdmin Whether this is for admin authentication
 * @returns Object containing all required callbacks
 */
export function createAuthCallbacks(isAdmin: boolean = false): Partial<CallbacksOptions> {
    return {
        async signIn({ account, profile }) {
            // For Google sign-in (only available for client users)
            if (account?.provider === 'google' && profile) {
                return handleGoogleSignIn(profile);
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || UserTypes.CLIENT;
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

        // We can add redirect if needed, but making the return type Partial<CallbacksOptions>
        // means we don't need to implement every callback
    };
}