// src/app/api/auth/complete-admin-setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, token } = await req.json();

        // Validate required fields
        if (!name || !email || !password || !token) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Find the invitation by token
            const invitation = await client.query(
                `SELECT * FROM admin_invitations 
         WHERE token = $1 
         AND email = $2
         AND used = false 
         AND expires > NOW()`,
                [token, email]
            );

            if (invitation.rows.length === 0) {
                return NextResponse.json(
                    { message: 'Invalid or expired token' },
                    { status: 400 }
                );
            }

            // Check if user already exists
            const existingUser = await client.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return NextResponse.json(
                    { message: 'A user with this email already exists' },
                    { status: 400 }
                );
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Start a transaction
            await client.query('BEGIN');

            try {
                // Create the admin user
                await client.query(
                    'INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, NOW())',
                    [name, email, hashedPassword, 'admin']
                );

                // Mark the invitation as used
                await client.query(
                    'UPDATE admin_invitations SET used = true, used_at = NOW(), updated_at = NOW() WHERE id = $1',
                    [invitation.rows[0].id]
                );

                await client.query('COMMIT');
            } catch (dbError) {
                await client.query('ROLLBACK');
                console.error("Transaction error:", dbError);
                return NextResponse.json(
                    { message: 'Database error occurred during account creation' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: 'Admin account created successfully',
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error completing admin setup:', error);
        return NextResponse.json(
            { message: 'Failed to complete admin setup' },
            { status: 500 }
        );
    }
}