// src/app/api/admin-auth/signin-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
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

        const client = await pool.connect();
        try {
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

            // Return the email associated with this token
            const email = result.rows[0].email;
            console.log(`POST: Token validated successfully for ${email}`);

            return NextResponse.json({
                valid: true,
                email: email
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('POST: Error validating signin token:', error);
        return NextResponse.json(
            { valid: false, message: 'Failed to validate signin token' },
            { status: 500 }
        );
    }
}

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