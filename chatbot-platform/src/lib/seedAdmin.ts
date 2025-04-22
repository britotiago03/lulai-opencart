// src/lib/seedAdmin.ts
import { pool } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { createHash, randomBytes } from 'crypto';

export async function seedAdminIfNeeded() {
    const ADMIN_NAME = 'Admin User';
    const ADMIN_EMAIL = 'britotiago101@gmail.com';

    const client = await pool.connect();
    try {
        const existingAdmins = await client.query(
            `SELECT * FROM users WHERE role = 'admin' LIMIT 1`
        );
        if (existingAdmins.rows.length > 0) return;

        const pending = await client.query(
            `SELECT * FROM admin_invitations WHERE email = $1 AND used = false AND expires > NOW()`,
            [ADMIN_EMAIL]
        );
        if (pending.rows.length > 0) return;

        const token = createHash('sha256').update(randomBytes(32)).digest('hex');
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 24);

        await client.query(
            `INSERT INTO admin_invitations (name, email, token, expires, used, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [ADMIN_NAME, ADMIN_EMAIL, token, expiration, false]
        );

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const setupUrl = `${baseUrl}/auth/admin-setup?token=${token}`;

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: 'Complete Your Admin Account Setup',
            html: `
                <h1>Admin Account Setup</h1>
                <p>Hello ${ADMIN_NAME},</p>
                <p>Click the link below to set your password:</p>
                <a href="${setupUrl}">${setupUrl}</a>
                <p>This link will expire in 24 hours.</p>
            `
        });

        console.log(`✅ Seeded initial admin invite to ${ADMIN_EMAIL}`);
    } catch (err) {
        console.error('❌ Failed to seed admin:', err);
    } finally {
        client.release();
    }
}
