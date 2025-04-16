// "/api/subscriptions/data" route
import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';
import { RetrievedSubscription } from '@/types/subscription';
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";

export async function GET(
    _: NextRequest,
    context: { params: Promise<{ subscriptionId: string }> }
) {
    try {
        // Await the params object before accessing properties
        const session = await getServerSession(userAuthOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        return await executeTransaction(async (client) => {
            const subscriptionResult = await client.query(
                `SELECT id, user_id, plan_type, price, status, current_period_start, current_period_renewal, created_at
                FROM subscriptions
                WHERE user_id = $1`,
                [session.user.id.toString()]
            );

            if (subscriptionResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Subscription not found' },
                    { status: 404 }
                );
            }

            const subscriptionData = subscriptionResult.rows[0];

            const subscription: RetrievedSubscription = {
                id: subscriptionData.id,
                user_id: subscriptionData.user_id,
                plan_type: subscriptionData.plan_type,
                price: parseFloat(subscriptionData.price),
                status: subscriptionData.status,
                start_date: subscriptionData.current_period_start,
                renewal_date: subscriptionData.current_period_renewal,
                created_at: subscriptionData.created_at,
            };

            console.log("Subscription data:", subscription);

            return NextResponse.json({ subscription });
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription details' },
            { status: 500 }
        );
    }
}