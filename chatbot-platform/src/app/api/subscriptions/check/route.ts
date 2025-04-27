import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from '@/lib/db';

// API endpoint to check if the current user has an active subscription
export async function GET() {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Query the database for active subscriptions for this user
        const result = await pool.query(
            `SELECT * FROM subscriptions 
            WHERE user_id = $1 
            AND status = 'active' 
            AND end_date > NOW()
            ORDER BY price DESC
            LIMIT 1`,
            [userId]
        );

        // Determine if user has an active subscription
        const hasActiveSubscription = result.rows.length > 0;

        // Get subscription type if exists
        const subscriptionType = hasActiveSubscription ? result.rows[0].plan_type : null;

        return NextResponse.json({
            hasActiveSubscription,
            subscriptionType
        });
    } catch (error) {
        console.error('Error checking subscription:', error);
        return NextResponse.json(
            { error: 'Failed to check subscription status', hasActiveSubscription: false },
            { status: 500 }
        );
    }
}