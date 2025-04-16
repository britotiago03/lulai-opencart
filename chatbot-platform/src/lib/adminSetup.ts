// lib/adminSetup.ts
import { pool } from "@/lib/db";
import { randomBytes, randomUUID } from "crypto";
import { sendAdminSetupEmail } from "@/lib/emailService";
import { PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";


/**
 * Generates a secure random string
 */
function generateSecureString(length: number = 32): string {
    return randomBytes(length).toString("hex").slice(0, length);
}

/**
 * Generates a secure but memorable access path
 */
function generateAccessPath(): string {
    // Generate a random path that's hard to guess but easy to type
    // Format will be: /secure-admin-XXXX
    return `/secure-admin-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Creates initial admin access token for first login
 * @param client - Database client for transaction
 * @param adminId - ID of the admin user
 */
async function createInitialAccessToken(
    client: PoolClient,
    adminId: number
): Promise<{path: string, key: string}> {
    // Generate a secure path and access key
    const path = generateAccessPath();
    const key = generateSecureString(16);

    // Create expiration date (30 days from now for initial setup)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert the new access token into the database
    // Use the provided client to ensure this is part of the transaction
    await client.query(
        `INSERT INTO admin_access_tokens
        (url_path, access_key, expires_at, created_by, is_active)
        VALUES ($1, $2, $3, $4, $5)`,
        [path, key, expiresAt, adminId, true]
    );

    return { path, key };
}

/**
 * Creates a temporary setup token for the first password setup
 */
async function createSetupToken(
    client: PoolClient,
    adminId: number
): Promise<string> {
    const token = randomUUID();

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert the token
    await client.query(
        'INSERT INTO verification_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
        [adminId, token, 'admin_setup', expiresAt]
    );

    return token;
}

/**
 * Creates the initial admin user and sends a setup email
 */
export async function setupInitialAdmin(): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if setup has already been completed
        const setupResult = await client.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'setup_completed'"
        );

        if (setupResult.rows.length > 0 && setupResult.rows[0].setting_value === 'true') {
            // Setup already done, don't do anything
            await client.query('ROLLBACK');
            return false;
        }

        // Get admin email from settings
        const emailResult = await client.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'admin_email'"
        );

        if (emailResult.rows.length === 0) {
            await client.query('ROLLBACK');
            console.error("Admin email setting not found");
            return false;
        }

        const adminEmail = emailResult.rows[0].setting_value;

        // Check if admin user already exists
        const userResult = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [adminEmail]
        );

        let adminId: number;
        const newAdminID = uuidv4();

        if (userResult.rows.length === 0) {
            // Create admin user without password (will be set later via email link)
            const insertResult = await client.query(
                `INSERT INTO users
                (id, name, email, role, verified)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [newAdminID, "Admin", adminEmail, 'admin', true]
            );

            adminId = insertResult.rows[0].id;
        } else {
            adminId = userResult.rows[0].id;
        }

        // Create access token for admin login page using the transaction client
        const accessToken = await createInitialAccessToken(client, adminId);

        // Create setup token for password setting using the transaction client
        const setupToken = await createSetupToken(client, adminId);

        // Send email with setup instructions
        await sendAdminSetupEmail(
            adminEmail,
            "Admin",
            setupToken,
            accessToken.path,
            accessToken.key
        );

        // Mark setup as not completed yet (will be completed after password set)
        await client.query(
            "UPDATE admin_settings SET setting_value = $1 WHERE setting_key = 'setup_completed'",
            ['in_progress']
        );

        await client.query('COMMIT');

        console.log("Admin setup initiated, email sent to:", adminEmail);
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error during admin setup:", error);
        return false;
    } finally {
        client.release();
    }
}

/**
 * Updates or creates an admin access token
 */
export async function updateAdminAccessToken(
    adminId: number,
    frequency: 'weekly' | 'monthly' = 'weekly'
): Promise<{path: string, key: string, expiresAt: Date}> {
    // Generate a secure path and access key
    const path = generateAccessPath();
    const key = generateSecureString(16);

    // Create expiration date based on frequency
    const expiresAt = new Date();
    if (frequency === 'weekly') {
        expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Start a transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify the admin user exists
        const adminCheck = await client.query(
            "SELECT 1 FROM admin_users WHERE id = $1",
            [adminId]
        );

        if (adminCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            console.error(`Admin user with ID ${adminId} does not exist.`);
            // Instead of throwing, return a rejected promise
            return Promise.reject(new Error(`Admin user with ID ${adminId} does not exist.`));
        }

        // Get current access tokens
        const currentTokenResult = await client.query(
            "SELECT id FROM admin_access_tokens WHERE is_active = true"
        );

        // For each active token, set it to inactive
        for (const token of currentTokenResult.rows) {
            await client.query(
                "UPDATE admin_access_tokens SET is_active = false WHERE id = $1",
                [token.id]
            );
        }

        // Insert the new access token
        await client.query(
            `INSERT INTO admin_access_tokens
            (url_path, access_key, expires_at, created_by, is_active)
            VALUES ($1, $2, $3, $4, $5)`,
            [path, key, expiresAt, adminId, true]
        );

        await client.query('COMMIT');

        return { path, key, expiresAt };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating admin access token:", error);
        throw error;
    } finally {
        client.release();
    }
}