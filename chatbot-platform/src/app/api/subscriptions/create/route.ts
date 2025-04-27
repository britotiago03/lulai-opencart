// app/api/subscriptions/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { userAuthOptions } from "@/lib/auth-config";
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { plan_type, price } = await request.json();

        // Check if user already has an active subscription
        const existingSubscription = await pool.query(
            `SELECT * FROM subscriptions 
            WHERE user_id = $1 
            AND status = 'active'
            AND end_date > NOW()`,
            [userId]
        );

        if (existingSubscription.rows.length > 0) {
            // User already has an active subscription
            return NextResponse.json({
                success: true,
                subscription_id: existingSubscription.rows[0].id,
                message: 'User already has an active subscription'
            });
        }

        // Calculate end date (1 year from now for free plans)
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        // Create subscription
        const result = await pool.query(
            `INSERT INTO subscriptions 
            (user_id, plan_type, price, status, start_date, end_date) 
            VALUES ($1, $2, $3, 'active', NOW(), $4)
            RETURNING id`,
            [userId, plan_type, price, endDate]
        );

        return NextResponse.json({
            success: true,
            subscription_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}