// src/app/api/admin-auth/validate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { message: 'Token is required' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Find the invitation by token
            const invitation = await client.query(
                `SELECT * FROM admin_invitations 
                 WHERE token = $1 
                 AND used = false 
                 AND expires > NOW()`,
                [token]
            );

            if (invitation.rows.length === 0) {
                return NextResponse.json(
                    { message: 'Invalid or expired token' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                name: invitation.rows[0].name,
                email: invitation.rows[0].email,
                message: 'Token is valid',
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error validating admin token:', error);
        return NextResponse.json(
            { message: 'Failed to validate token' },
            { status: 500 }
        );
    }
}