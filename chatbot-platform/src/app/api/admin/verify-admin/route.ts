// app/api/admin/verify-admin/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get token from request
        const token = await getToken({ 
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: 'admin-session-token' // Match your admin cookie name
        });

        console.log('Verification token:', {
            id: token?.id,
            adminAuthOrigin: token?.adminAuthOrigin
        });

        if (!token?.adminAuthOrigin) {
            console.log('Missing adminAuthOrigin in token');
            return NextResponse.json(
                { isAdmin: false, error: 'Invalid admin origin' },
                { status: 403 }
            );
        }

        // Verify admin status in database
        const result = await pool.query(
            'SELECT is_super_admin FROM admin_users WHERE id = $1',
            [token.id]
        );

        console.log('Admin verification result:', result);

        
        const isAdmin = result.rows[0]?.is_super_admin === true;
        
        if (!isAdmin) {
            console.log('User is not an admin:', token.id);
            return NextResponse.json(
                { isAdmin: false, error: 'Not an admin' },
                { status: 403 }
            );
        }

        return NextResponse.json({ isAdmin: true });

    } catch (error) {
        console.error('Admin verification error:', error);
        return NextResponse.json(
            { isAdmin: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}