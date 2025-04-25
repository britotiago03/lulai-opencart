// src/lib/auth/google.ts
import { pool } from "@/lib/db";
import { UserTypes } from "./types";

/**
 * Handles Google sign-in authentication flow
 * @param profile Google profile data
 * @returns Boolean indicating successful authentication
 */
export async function handleGoogleSignIn(profile: any): Promise<boolean> {
    const { name, email, sub } = profile;

    if (!email) {
        console.error("No email provided from Google");
        return false;
    }

    try {
        const client = await pool.connect();
        try {
            // Check if user exists
            const existingUserResult = await client.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (existingUserResult.rows.length > 0) {
                const user = existingUserResult.rows[0];
                // Only allow Google auth for client users, not admins
                if (user.role === UserTypes.ADMIN) {
                    console.log(`Google sign in attempted for admin account: ${email}`);
                    return false;
                }
                console.log(`Existing user signed in with Google: ${email}`);
                return true;
            } else {
                // Use the Google sub (subject) as the user ID, which is their unique Google identifier
                const googleId = sub; // Google's unique identifier for the user

                // Create new user with Google auth, using Google ID as user ID (as TEXT)
                await client.query(
                    "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
                    [googleId.toString(), name, email, "GOOGLE_AUTH", UserTypes.CLIENT]
                );
                console.log(`New user created via Google auth: ${email} with ID: ${googleId}`);
                return true;
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Google sign in error:", error);
        return false;
    }
}