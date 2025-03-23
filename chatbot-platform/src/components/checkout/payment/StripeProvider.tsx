"use client";

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentData } from '@/types/payment';
import { StripeElementsForm } from './StripeElementsForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
    onSubmitAction: (paymentData: StripePaymentData) => void;
    isSubmitting: boolean;
    amount: number;
}

export function StripeProvider({ onSubmitAction, isSubmitting, amount }: StripeProviderProps) {
    // Ensure amount is valid and at least 0.5 (50 cents minimum for Stripe)
    const validAmount = Math.max(0.5, amount || 0.5);
    const amountInCents = Math.round(validAmount * 100);

    const options = {
        mode: 'payment' as const,
        amount: amountInCents, // Convert to cents and ensure it's > 0
        currency: 'usd',
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#10b981',
                borderRadius: '4px',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <StripeElementsForm
                onSubmitAction={onSubmitAction}
                isSubmitting={isSubmitting}
                amount={validAmount}
            />
        </Elements>
    );
}