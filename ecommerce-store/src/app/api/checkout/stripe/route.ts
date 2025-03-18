import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction, calculateOrderTotals, insertShippingAddress, insertOrderItems } from '@/lib/db';
import { OrderData } from '@/types/payment';
import { CartItem } from '@/lib/db';
import stripe from '@/lib/stripe';
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const data: OrderData = await request.json();

        // Validate required data
        if (!data.customerInfo || !data.paymentData || !data.cartItems || data.cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Missing required checkout information' },
                { status: 400 }
            );
        }

        // Get the current session to identify the user
        const session = await getServerSession(userAuthOptions);
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

        // Calculate order totals
        const { subtotal, shippingAmount, taxAmount, totalAmount } = calculateOrderTotals(data.cartItems as CartItem[]);

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

                // Insert order record - now includes user_id
                const orderResult = await client.query(
                    `INSERT INTO orders 
                    (user_id, session_id, status, payment_method, payment_status, payment_details, 
                    shipping_amount, tax_amount, subtotal_amount, total_amount)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id`,
                    [
                        userId, // Added user ID
                        sessionId,
                        'processing',
                        'stripe',
                        paymentStatus,
                        JSON.stringify({
                            cardLast4,
                            cardBrand,
                            paymentIntentId,
                            cardholderName: data.paymentData.cardholderName,
                            stripePaymentIntentStatus: paymentIntent.status
                        }),
                        shippingAmount,
                        taxAmount,
                        subtotal,
                        totalAmount
                    ]
                );

                const orderId = orderResult.rows[0].id;
                console.log(`Created order ${orderId} for user ${userId}`);

                // Insert shipping address
                await insertShippingAddress(client, orderId, data.customerInfo);

                // Insert order items
                await insertOrderItems(client, orderId, data.cartItems as CartItem[]);

                // If the payment requires further action (like 3D Secure), return the client secret
                if (paymentIntent.status === 'requires_action') {
                    return NextResponse.json({
                        requiresAction: true,
                        clientSecret: paymentIntent.client_secret,
                        orderId
                    });
                }

                // Otherwise return success
                return NextResponse.json({
                    success: true,
                    orderId,
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