// src/app/api/admin-auth/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { pool } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Generate a secure token
const generateSecureToken = () => {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
};

export async function POST(req: NextRequest) {
    try {
        const { name, email, token } = await req.json();

        // Validate required fields
        if (!name || !email || !token) {
            return NextResponse.json(
                { message: 'Name, email, and token are required' },
                { status: 400 }
            );
        }

        // Validate security token
        const expectedToken = process.env.ADMIN_CREATE_TOKEN || 'create-admin-123456';
        if (token !== expectedToken) {
            return NextResponse.json(
                { message: 'Invalid security token' },
                { status: 403 }
            );
        }

        // Check if admin with this email already exists
        const client = await pool.connect();
        try {
            const existingAdmin = await client.query(
                'SELECT * FROM users WHERE email = $1 AND role = $2',
                [email, 'admin']
            );

            if (existingAdmin.rows.length > 0) {
                return NextResponse.json(
                    { message: 'An admin with this email already exists' },
                    { status: 400 }
                );
            }

            // Generate a unique setup token
            const setupToken = generateSecureToken();

            // Set expiration for 24 hours from now
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 24);

            // Store the admin invitation in the database
            await client.query(
                `INSERT INTO admin_invitations 
                 (name, email, token, expires, used, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [name, email, setupToken, expiration, false]
            );

            // Generate the setup URL
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const setupUrl = `${baseUrl}/admin/setup?token=${setupToken}`;
            const dashboardUrl = `${baseUrl}/admin`; // Corrected admin dashboard URL

            // Send email with the setup link and dashboard information
            await sendEmail({
                to: email,
                subject: 'Complete Your Admin Account Setup',
                html: `
                    <h1>Admin Account Setup</h1>
                    <p>Hello ${name},</p>
                    <p>You have been invited to be an administrator for Lulai. Please click the link below to set up your password and complete your account registration:</p>
                    <p><a href="${setupUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:15px 0;">Complete Account Setup</a></p>
                    <p>This setup link will expire in 24 hours.</p>
                    <h2>Next Steps</h2>
                    <p>After setting up your password:</p>
                    <ol>
                        <li>You can access the admin dashboard at: <a href="${dashboardUrl}">${dashboardUrl}</a></li>
                        <li>Use your email and the password you created to sign in</li>
                        <li>Bookmark the dashboard link for easy access in the future</li>
                    </ol>
                    <p>If you did not request this invitation, please ignore this email.</p>
                    <hr>
                    <p style="color:#666; font-size:12px;">This is an automated email, please do not reply.</p>
                `,
            });

            return NextResponse.json(
                { message: 'Admin invitation sent successfully' },
                { status: 200 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error sending admin invitation:', error);
        return NextResponse.json(
            { message: 'Failed to send admin invitation' },
            { status: 500 }
        );
    }
}