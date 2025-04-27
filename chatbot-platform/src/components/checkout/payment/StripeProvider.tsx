"use client";

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentData } from '@/types/payment';
import { StripeElementsForm } from './StripeElementsForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
    onSubmitAction: (paymentData: StripePaymentData) => Promise<void>;
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
            theme: 'night' as const, // Using dark theme to match dashboard
            variables: {
                colorPrimary: '#3b82f6', // Blue to match dashboard theme
                colorBackground: '#1b2539', // Match card background
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                borderRadius: '6px',
                spacingUnit: '4px',
            },
            rules: {
                '.Input': {
                    backgroundColor: '#2a3349', // Match input background
                    color: 'white',
                    border: '1px solid #4b5563',
                },
                '.Label': {
                    color: '#9ca3af',
                },
                '.Tab': {
                    backgroundColor: '#1b2539',
                    color: '#9ca3af',
                    borderColor: '#4b5563',
                },
                '.Tab--selected': {
                    backgroundColor: '#2a3349',
                    color: 'white',
                    borderColor: '#3b82f6',
                }
            }
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