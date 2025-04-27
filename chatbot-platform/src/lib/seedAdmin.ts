// src/lib/seedAdmin.ts
import { pool } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { createHash, randomBytes } from 'crypto';

// Generate a token function
const generateToken = () => {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
};

export async function seedAdminIfNeeded() {
    const ADMIN_NAME = 'Admin User';
    const ADMIN_EMAIL = 'britotiago101@gmail.com';

    const client = await pool.connect();
    try {
        // Check if any admin exists
        const existingAdmins = await client.query(
            `SELECT * FROM users WHERE role = 'admin' LIMIT 1`
        );
        if (existingAdmins.rows.length > 0) return;

        // Check if there's a pending invitation
        const pending = await client.query(
            `SELECT * FROM admin_invitations WHERE email = $1 AND used = false AND expires > NOW()`,
            [ADMIN_EMAIL]
        );
        if (pending.rows.length > 0) return;

        // Generate setup token
        const setupToken = generateToken();

        // Generate signin token
        const signinToken = generateToken();

        // Set expiration for 24 hours from now
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 24);

        // Start a transaction
        await client.query('BEGIN');

        try {
            // Store the invitation
            await client.query(
                `INSERT INTO admin_invitations (name, email, token, expires, used, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [ADMIN_NAME, ADMIN_EMAIL, setupToken, expiration, false]
            );

            // Store the signin token
            await client.query(
                `INSERT INTO admin_signin_tokens 
                 (email, token, expires, created_at) 
                 VALUES ($1, $2, $3, NOW())`,
                [ADMIN_EMAIL, signinToken, expiration]
            );

            await client.query('COMMIT');
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error('Database error during seeding:', dbError);
        }

        // Generate the setup URL using the admin setup path
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const setupUrl = `${baseUrl}/admin/setup?token=${setupToken}`;
        const dashboardUrl = `${baseUrl}/admin`;
        const signinUrl = `${baseUrl}/admin/signin?signinToken=${signinToken}`;

        // Send the invitation email with improved formatting
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: 'Complete Your Admin Account Setup',
            html: `
                <h1>Admin Account Setup</h1>
                <p>Hello ${ADMIN_NAME},</p>
                <p>You have been invited to be an administrator for Lulai. Please click the link below to set up your password and complete your account registration:</p>
                <p><a href="${setupUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:15px 0;">Complete Account Setup</a></p>
                <p>This setup link will expire in 24 hours.</p>
                <h2>Next Steps</h2>
                <p>After setting up your password:</p>
                <ol>
                    <li>You can access the admin dashboard at: <a href="${dashboardUrl}">${dashboardUrl}</a></li>
                    <li>Use your email and the password you created to sign in</li>
                    <li>If you are signed out, you can use this secure admin signin link: <a href="${signinUrl}">Admin Sign In</a></li>
                    <li>Bookmark this signin link for easy access in the future</li>
                </ol>
                <p>If you did not request this invitation, please ignore this email.</p>
                <hr>
                <p style="color:#666; font-size:12px;">This is an automated email, please do not reply.</p>
            `
        });

        console.log(`✅ Seeded initial admin invite to ${ADMIN_EMAIL}`);
    } catch (err) {
        console.error('❌ Failed to seed admin:', err);
    } finally {
        client.release();
    }
}