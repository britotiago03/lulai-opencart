import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from '@/lib/db';

// Get details for a specific subscription
export async function GET(
    _req: Request,
    context: { params: { id: string } }
) {
    try {
        const params = await context.params; // 🛠️ FIX: Await params
        const subscriptionId = params.id;

        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Fetch the subscription details
        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE id = $1
             AND user_id = $2`,
            [subscriptionId, session.user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        const subscription = result.rows[0];

        // Normalize price to number (important for frontend)
        const normalizedSubscription = {
            ...subscription,
            price: subscription.price ? parseFloat(subscription.price) : 0,
        };

        return NextResponse.json({
            subscription: normalizedSubscription
        });

    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription details' },
            { status: 500 }
        );
    }
}
