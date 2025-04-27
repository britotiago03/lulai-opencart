// src/app/api/admin-auth/signin-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';
import { PoolClient } from 'pg';

// Generate a secure token
const generateSecureToken = () => {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
};

// For GET requests - validate token without marking as used
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const signinToken = url.searchParams.get('token');

        console.log("GET: Validating signin token:", signinToken);

        if (!signinToken) {
            console.log("GET: Missing signin token");
            return NextResponse.json(
                { message: 'Signin token is required' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Check if the token exists and is valid
            console.log("GET: Querying database for token");
            const result = await client.query(
                `SELECT * FROM admin_signin_tokens 
                 WHERE token = $1 
                 AND expires > NOW()
                 AND used_at IS NULL`,
                [signinToken]
            );

            console.log("GET: Query result:", result.rows.length > 0 ? "Token found" : "Token not found");

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { valid: false, message: 'Invalid or expired signin token' },
                    { status: 400 }
                );
            }

            // Return validation result without marking as used
            const email = result.rows[0].email;
            console.log(`GET: Token validated successfully for ${email}`);

            return NextResponse.json({
                valid: true,
                email: email
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('GET: Error validating signin token:', error);
        return NextResponse.json(
            { valid: false, message: 'Failed to validate signin token' },
            { status: 500 }
        );
    }
}

// For POST requests - validate, mark as used, and generate a new token
export async function POST(req: NextRequest) {
    let client: PoolClient | undefined = undefined;

    try {
        const { signinToken } = await req.json();

        console.log("POST: Validating signin token:", signinToken);

        if (!signinToken) {
            console.log("POST: Missing signin token");
            return NextResponse.json(
                { message: 'Signin token is required' },
                { status: 400 }
            );
        }

        client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Check if the token exists and is valid
        console.log("POST: Querying database for token");
        const result = await client.query(
            `SELECT * FROM admin_signin_tokens 
             WHERE token = $1 
             AND expires > NOW()
             AND used_at IS NULL`,
            [signinToken]
        );

        console.log("POST: Query result:", result.rows.length > 0 ? "Token found" : "Token not found");

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { valid: false, message: 'Invalid or expired signin token' },
                { status: 400 }
            );
        }

        // Mark token as used
        console.log("POST: Marking token as used");
        await client.query(
            `UPDATE admin_signin_tokens 
             SET used_at = NOW() 
             WHERE token = $1`,
            [signinToken]
        );

        // Get admin user info
        const email = result.rows[0].email;
        const adminUser = await client.query(
            'SELECT name FROM users WHERE email = $1 AND role = $2',
            [email, 'admin']
        );

        const adminName = adminUser.rows.length > 0 ? adminUser.rows[0].name : 'Admin User';

        // Generate a new signin token
        const newSigninToken = generateSecureToken();

        // Set expiration for 24 hours from now
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 24);

        // Store the new token
        await client.query(
            `INSERT INTO admin_signin_tokens 
             (email, token, expires, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [email, newSigninToken, expiration]
        );

        // Commit the transaction
        await client.query('COMMIT');

        console.log(`POST: Token validated successfully for ${email}`);
        console.log(`POST: New token generated for ${email}`);

        // Generate the signin URL
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const signinUrl = `${baseUrl}/admin/signin?signinToken=${newSigninToken}`;

        // Send a new email with the updated signin link
        await sendEmail({
            to: email,
            subject: 'Your Updated Admin Signin Link',
            html: `
                <h1>Updated Admin Signin Link</h1>
                <p>Hello ${adminName},</p>
                <p>You recently used your admin signin link. For security, we've generated a new link for your next signin:</p>
                <p><a href="${signinUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:15px 0;">Admin Sign In</a></p>
                <p>This link will expire in 24 hours. Please bookmark this new link for future access.</p>
                <p>If you did not request this link, please contact the system administrator immediately.</p>
                <hr>
                <p style="color:#666; font-size:12px;">This is an automated email, please do not reply.</p>
            `
        });

        return NextResponse.json({
            valid: true,
            email: email,
            message: "A new signin link has been sent to your email"
        });

    } catch (error) {
        console.error('POST: Error validating signin token:', error);
        return NextResponse.json(
            { valid: false, message: 'Failed to validate signin token' },
            { status: 500 }
        );
    } finally {
        // Release client if it exists
        if (client) {
            client.release();
        }
    }
}