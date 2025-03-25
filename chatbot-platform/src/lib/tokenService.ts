// lib/tokenService.ts
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { QueryResult } from 'pg';

// Token types
export const TOKEN_TYPES = {
    EMAIL_VERIFICATION: 'email_verification',
    EMAIL_CHANGE: 'email_change',
    PASSWORD_RESET: 'password_reset',
    ADMIN_SETUP: 'admin_setup'
};

// Define a minimal interface for what we need from a database client
interface QueryExecutor {
    query(text: string, params: (string | number | Date | null)[]): Promise<QueryResult>;
}

// Generate a random token
export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

// Create a verification token in the database
export async function createVerificationToken(
    userId: number,
    type: string,
    newEmail?: string,
    client?: QueryExecutor
): Promise<string> {
    const dbClient = client || pool;

    // Delete any existing tokens of the same type for this user
    await dbClient.query(
        'DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2',
        [userId, type]
    );

    // Generate a new token
    const token = generateToken();

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert the token
    await dbClient.query(
        'INSERT INTO verification_tokens (user_id, token, type, expires_at, new_email) VALUES ($1, $2, $3, $4, $5)',
        [userId, token, type, expiresAt, newEmail || null]
    );

    return token;
}

// Verify a token
export async function verifyToken(token: string): Promise<{
    valid: boolean;
    userId?: number;
    newEmail?: string | null;
    type?: string;
}> {
    // Get the token from the database
    const result = await pool.query(
        'SELECT * FROM verification_tokens WHERE token = $1 AND expires_at > NOW()',
        [token]
    );

    if (result.rows.length === 0) {
        return { valid: false };
    }

    const tokenData = result.rows[0];

    return {
        valid: true,
        userId: tokenData.user_id,
        newEmail: tokenData.new_email,
        type: tokenData.type
    };
}

// Delete a token
export async function deleteToken(token: string): Promise<void> {
    await pool.query('DELETE FROM verification_tokens WHERE token = $1', [token]);
}

// Delete all tokens for a user of a specific type
export async function deleteUserTokens(userId: number, type: string): Promise<void> {
    await pool.query(
        'DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2',
        [userId, type]
    );
}