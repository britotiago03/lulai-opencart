"use client";

import React, { useState } from "react";
import {
    useStripe,
    useElements,
    PaymentElement,
    AddressElement
} from "@stripe/react-stripe-js";
import { StripePaymentData } from "@/types/payment";
import { useCreatePaymentIntent } from "@/hooks/useCreatePaymentIntent";
import { StripeErrorAlert } from "@/components/checkout/payment/StripeErrorAlert";

interface StripeElementsFormProps {
    onSubmitAction: (paymentData: StripePaymentData) => Promise<void>;
    isSubmitting: boolean;
    amount: number;
}

export function StripeElementsForm({ onSubmitAction, isSubmitting, amount }: StripeElementsFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { clientSecret, error: intentError } = useCreatePaymentIntent(amount);

    const [cardholderName, setCardholderName] = useState("");
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) return;

        setProcessing(true);
        setFormError(null);

        try {
            const { error: submitError } = await elements.submit();

            if (submitError) {
                setFormError(submitError.message || "Payment validation failed. Please check your information.");
                setProcessing(false);
                return;
            }

            const result = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: "if_required",
            });

            if (result.error) {
                setFormError(result.error.message || "Payment failed. Please try again.");
                setProcessing(false);
                return;
            }

            if (result.paymentIntent?.id) {
                const paymentMethodId =
                    typeof result.paymentIntent.payment_method === "string"
                        ? result.paymentIntent.payment_method
                        : result.paymentIntent.payment_method?.id || "unknown";

                await onSubmitAction({
                    paymentMethodId,
                    amount: amount * 100,
                    currency: "usd",
                    description: `LulAI Subscription - $${amount}/month`,
                    customer: {
                        name: cardholderName,
                        email: "user@example.com",
                    },
                    paymentIntentId: result.paymentIntent.id,
                });
            } else {
                setFormError("Payment failed. Please try again.");
                setProcessing(false);
            }
        } catch (err) {
            console.error("Payment error:", err);
            setFormError("An unexpected error occurred during payment. Please try again.");
            setProcessing(false);
        }
    };

    const isDisabled = !stripe || !clientSecret || isSubmitting || processing;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {(intentError || formError) && (
                <StripeErrorAlert message={formError || intentError!} />
            )}

            {/* Cardholder Name */}
            <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-300 mb-1">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    id="cardholderName"
                    placeholder="John Smith"
                    className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                />
            </div>

            {/* Card Information */}
            <div className="rounded-md overflow-hidden">
                <label className="block text-sm font-medium text-gray-300 mb-2">Card Information</label>
                <PaymentElement />
            </div>

            {/* Billing Address */}
            <div className="rounded-md overflow-hidden mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Billing Address</label>
                <AddressElement
                    options={{
                        mode: "billing",
                        defaultValues: {
                            name: cardholderName,
                        },
                        fields: { phone: "auto" },
                    }}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isDisabled}
                className={`w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition flex justify-center ${
                    isDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
            >
                {processing || isSubmitting ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    `Pay $${amount.toFixed(2)}/month`
                )}
            </button>

            {/* Disclaimer */}
            <div className="mt-4 text-sm text-gray-400 text-center">
                <p>Your payment information is securely processed by Stripe.</p>
                <p className="mt-1">No actual charges will be made in this demo.</p>
            </div>
        </form>
    );
}
