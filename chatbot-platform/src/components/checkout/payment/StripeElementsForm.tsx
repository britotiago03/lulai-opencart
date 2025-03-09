"use client";

import React, { useState, useEffect } from "react";
import {
    useStripe,
    useElements,
    PaymentElement,
    AddressElement
} from '@stripe/react-stripe-js';
import { StripePaymentData } from "@/types/payment";

interface StripeElementsFormProps {
    onSubmitAction: (paymentData: StripePaymentData) => void;
    isSubmitting: boolean;
    amount: number;
}

export function StripeElementsForm({ onSubmitAction, isSubmitting, amount }: StripeElementsFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [cardholderName, setCardholderName] = useState("");
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // Fetch clientSecret when component mounts
    useEffect(() => {
        // Skip if amount is not positive
        if (!(amount > 0)) {
            return;
        }

        // Define the async function
        const createPaymentIntent = async () => {
            try {
                const response = await fetch('/api/checkout/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: Math.round(amount * 100) // Convert to cents
                    }),
                });

                if (!response.ok) {
                    // Log error details instead of throwing
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

        // Use an immediately invoked async function to properly handle the promise
        (async () => {
            await createPaymentIntent();
        })();
    }, [amount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            // Stripe.js hasn't loaded yet or clientSecret is not available
            // Make sure to disable form submission until both are loaded
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // First, submit the Elements form - this is required before confirmPayment
            const { error: submitError } = await elements.submit();

            if (submitError) {
                setError(submitError.message || "Payment validation failed. Please check your information.");
                setProcessing(false);
                return;
            }

            // After successful form submission, confirm the payment
            const result = await stripe.confirmPayment({
                elements,
                clientSecret, // Use the client secret obtained from the server
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: 'if_required',
            });

            if (result.error) {
                setError(result.error.message || "Payment failed. Please try again.");
                setProcessing(false);
                return;
            }

            // If we get here without a redirect, payment succeeded
            if (result.paymentIntent && result.paymentIntent.id) {
                onSubmitAction({
                    paymentMethod: "stripe",
                    cardholderName: cardholderName,
                    paymentIntentId: result.paymentIntent.id,
                });
            } else {
                setError("Payment failed. Please try again.");
                setProcessing(false);
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError("An unexpected error occurred during payment. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="cardholderName" className="block text-gray-700 mb-1">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    id="cardholderName"
                    placeholder="John Smith"
                    className="w-full p-2 border rounded border-gray-300"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                />
            </div>

            <div className="p-4 border rounded">
                <label className="block text-gray-700 mb-2">Card Information</label>
                <PaymentElement />
            </div>

            <div className="p-4 border rounded">
                <label className="block text-gray-700 mb-2">Billing Address</label>
                <AddressElement options={{ mode: 'billing' }} />
            </div>

            <button
                type="submit"
                disabled={!stripe || !clientSecret || isSubmitting || processing}
                className={`w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition ${
                    !stripe || !clientSecret || isSubmitting || processing ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
                {processing || isSubmitting ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
}