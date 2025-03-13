import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';
import { SubscriptionData } from '@/types/payment';
import stripe from '@/lib/stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const data: SubscriptionData = await request.json();

        // Validate required data
        if (!data.paymentData || !data.subscription) {
            return NextResponse.json(
                { error: 'Missing required checkout information' },
                { status: 400 }
            );
        }

        // Get the current session to identify the user
        const session = await getServerSession(authOptions);
        console.log("Checkout session:", session);

        // Get userId from session or look it up by email
        let userId = null;
        if (session?.user) {
            if (session.user.id) {
                userId = session.user.id;
            } else if (session.user.email) {
                // Get user from database by email
                const userResult = await pool.query(
                    "SELECT id FROM users WHERE email = $1",
                    [session.user.email]
                );

                if (userResult.rows.length > 0) {
                    userId = userResult.rows[0].id;
                }
            }
        }

        console.log("Order will be created with user ID:", userId);

        // Get the payment intent ID from the request
        const { paymentIntentId } = data.paymentData;

        if (!paymentIntentId) {
            return NextResponse.json(
                { error: 'No payment intent ID provided' },
                { status: 400 }
            );
        }

        try {
            // Retrieve the payment intent to confirm payment status
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            // Process the order using our transaction helper
            return await executeTransaction(async (client) => {
                // Generate session ID for guest checkout
                const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);

                // Payment status based on Stripe payment intent status
                const paymentStatus = paymentIntent.status === 'succeeded' ? 'paid' :
                    (paymentIntent.status === 'requires_capture' ? 'authorized' : 'pending');

                // Get payment method details for storing with the order
                let cardLast4 = '****';
                let cardBrand = '';

                if (paymentIntent.payment_method) {
                    try {
                        const paymentMethod = await stripe.paymentMethods.retrieve(
                            paymentIntent.payment_method as string
                        );

                        if (paymentMethod.type === 'card' && paymentMethod.card) {
                            cardLast4 = paymentMethod.card.last4;
                            cardBrand = paymentMethod.card.brand;
                        }
                    } catch (error) {
                        console.error('Error retrieving payment method:', error);
                    }
                }

                // Insert subscription record
                if (!data.subscription) {
                    throw new Error('Subscription data is missing');
                }

                const subscriptionResult = await pool.query(
                    `INSERT INTO subscriptions 
                    (user_id, plan_type, price, status, current_period_start, current_period_end, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [
                        userId,
                        data.subscription.plan_type,
                        data.subscription.price,
                        paymentStatus,
                        new Date().toISOString(),
                        new Date(new Date().setMonth(new Date().getMonth() +1)).toISOString(),
                        new Date().toISOString(),
                    ]
                );

                const subscriptionId = subscriptionResult.rows[0].id;
                console.log(`Created subscription ${subscriptionId} for user ${userId}`);

                // If the payment requires further action (like 3D Secure), return the client secret
                if (paymentIntent.status === 'requires_action') {
                    return NextResponse.json({
                        requiresAction: true,
                        clientSecret: paymentIntent.client_secret,
                        subscriptionId
                    });
                }

                // Otherwise return success
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