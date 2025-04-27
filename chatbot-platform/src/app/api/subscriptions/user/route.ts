import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from '@/lib/db';

// Get all subscriptions for the current user
export async function GET() {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Fetch all subscriptions for this user, ordered by creation date
        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return NextResponse.json({
            subscriptions: result.rows.map((row) => ({
                ...row,
                price: row.price ? parseFloat(row.price) : 0, // ✅ price parsed as number
            })),
        });

    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}
