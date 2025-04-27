"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { StripeProvider } from "@/components/checkout/payment/StripeProvider";
import { StripePaymentData, SubscriptionData } from "@/types/payment";
import { Subscription } from "@/types/subscription";
import { CreditCard, AlertCircle } from "lucide-react";

interface CheckoutComponentProps {
    selectedSubscription: Subscription | null;
}

export default function CheckoutComponent({ selectedSubscription }: CheckoutComponentProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handlePaymentSubmit = async (paymentData: StripePaymentData) => {
        if (!selectedSubscription) {
            setCheckoutError("No subscription selected");
            return;
        }

        setIsSubmitting(true);
        setCheckoutError(null);

        try {
            console.log("Processing payment with data:", paymentData);

            const subscriptionData: SubscriptionData = {
                paymentMethod: "stripe",
                paymentData,
                subscription: {
                    plan_type: selectedSubscription.plan_type as 'free' | 'basic' | 'pro',
                    price: selectedSubscription.price
                }
            };

            const response = await fetch("/api/checkout/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscriptionData),
            });

            const data = await response.json();

            if (!response.ok) {
                setCheckoutError(data.error || "Failed to process payment");
                setIsSubmitting(false);
                return;
            }

            console.log("Payment processed successfully:", data);

            // Redirect to order confirmation
            router.push(`/order-confirmation/${data.subscriptionId}`);
        } catch (error) {
            console.error("Payment error:", error);
            setCheckoutError(error instanceof Error ? error.message : "An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="bg-[#1b2539] rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <CreditCard className="h-6 w-6 text-blue-500 mr-2" />
                                <h2 className="text-xl font-bold text-white">Payment Information</h2>
                            </div>

                            {checkoutError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 flex items-start">
                                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{checkoutError}</span>
                                </div>
                            )}

                            <div className="mt-6">
                                <StripeProvider
                                    onSubmitAction={handlePaymentSubmit}
                                    isSubmitting={isSubmitting}
                                    amount={typeof selectedSubscription?.price === "number" ? selectedSubscription.price : 0}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/3">
                    <OrderSummary subscription={selectedSubscription} />
                </div>
            </div>
        </div>
    );
}