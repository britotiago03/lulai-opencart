// src/hooks/useCreatePaymentIntent.ts
"use client";

import { useEffect, useState } from "react";

export function useCreatePaymentIntent(amount: number) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!(amount > 0)) return;

        const createPaymentIntent = async () => {
            try {
                const response = await fetch('/api/checkout/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(amount * 100) }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error(`Failed to create payment intent: ${response.status} ${errorData}`);
                    setError("Failed to initialize payment. Please try again.");
                    return;
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Error creating payment intent:", err);
                setError("Failed to initialize payment. Please try again.");
            }
        };

        void createPaymentIntent();
    }, [amount]);

    return { clientSecret, error };
}
