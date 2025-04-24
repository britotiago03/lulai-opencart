// src/app/api/admin-auth/create-signin-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { pool } from '@/lib/db';

// Generate a secure token
const generateSecureToken = () => {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
};

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Verify the email belongs to an admin
            const userResult = await client.query(
                'SELECT * FROM users WHERE email = $1 AND role = $2',
                [email, 'admin']
            );

            if (userResult.rows.length === 0) {
                return NextResponse.json(
                    { message: 'No admin user found with this email' },
                    { status: 404 }
                );
            }

            // Generate a signin token
            const signinToken = generateSecureToken();

            // Set expiration for 24 hours from now
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 24);

            // Store the token in the database
            await client.query(
                `INSERT INTO admin_signin_tokens 
                 (email, token, expires, created_at) 
                 VALUES ($1, $2, $3, NOW())`,
                [email, signinToken, expiration]
            );

            // Generate the signin URL
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const signinUrl = `${baseUrl}/admin/signin?signinToken=${signinToken}`;

            return NextResponse.json({
                message: 'Admin signin token created successfully',
                signinUrl,
                signinToken,
                expires: expiration
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating signin token:', error);
        return NextResponse.json(
            { message: 'Failed to create signin token' },
            { status: 500 }
        );
    }
}