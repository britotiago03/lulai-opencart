// src/lib/auth/validation.ts
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserTypes, ValidatedUser } from "./types";

/**
 * Validates user credentials for a specific user type
 * @param email User email
 * @param password User password
 * @param userType Type of user (client or admin)
 * @returns Validated user data or null if validation fails
 */
export async function validateUserCredentials(
    email: string,
    password: string,
    userType: string
): Promise<ValidatedUser | null> {
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
                id: user.id.toString(), // Ensure ID is a string
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