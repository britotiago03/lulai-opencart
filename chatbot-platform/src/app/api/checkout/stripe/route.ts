import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { SubscriptionData } from '@/types/payment';
import { executeTransaction } from '@/lib/db';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const data: SubscriptionData = await request.json();

        if (!data.subscription || !data.paymentData) {
            return NextResponse.json(
                { error: 'Missing required payment information' },
                { status: 400 }
            );
        }

        const userId: string = session.user.id;
        const { paymentIntentId } = data.paymentData;

        if (!paymentIntentId) {
            return NextResponse.json(
                { error: 'No payment intent ID provided' },
                { status: 400 }
            );
        }

        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            return await executeTransaction(async (client) => {
                if (!data.subscription) {
                    throw new Error('Subscription data is required');
                }

                const paymentStatus = paymentIntent.status === 'succeeded' ? 'paid' :
                    (paymentIntent.status === 'requires_capture' ? 'authorized' : 'pending');

                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                // 1. Insert the new subscription
                const subscriptionResult = await client.query(
                    `INSERT INTO subscriptions 
                    (user_id, plan_type, price, status, payment_method, payment_id, start_date, end_date, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id`,
                    [
                        userId,
                        data.subscription.plan_type,
                        data.subscription.price,
                        'active',
                        data.paymentMethod || 'stripe',
                        paymentIntentId,
                        new Date().toISOString(),
                        endDate.toISOString(),
                        new Date().toISOString(),
                    ]
                );

                const subscriptionId = subscriptionResult.rows[0].id;
                console.log(`Created subscription ${subscriptionId} for user ${userId}`);

                // 2. Cancel all previous active subscriptions
                await client.query(
                    `UPDATE subscriptions
                     SET status = 'cancelled'
                     WHERE user_id = $1
                     AND id != $2
                     AND status = 'active'`,
                    [userId, subscriptionId]
                );

                // 3. Handle 3D secure if needed
                if (paymentIntent.status === 'requires_action') {
                    return NextResponse.json({
                        requiresAction: true,
                        clientSecret: paymentIntent.client_secret,
                        subscriptionId
                    });
                }

                return NextResponse.json({
                    success: true,
                    subscriptionId,
                    paymentStatus
                });
            });
        } catch (stripeError) {
            console.error('Stripe error:', stripeError);
            return NextResponse.json(
                { error: 'Failed to process payment with Stripe' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
