import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();

        // Create a PaymentIntent with the specified amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // amount in cents, rounded to handle floating point issues
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                integration_type: 'next-stripe',
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}