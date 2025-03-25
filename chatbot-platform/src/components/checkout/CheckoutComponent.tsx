"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { StripeProvider } from "@/components/checkout/payment/StripeProvider";
import { StripePaymentData, SubscriptionData } from "@/types/payment";
import { Subscription } from "@/types/subscription";

interface SubscriptionComponentProps {
    selectedSubscription: Subscription | null;
}

export default function CheckoutComponent({ selectedSubscription }: SubscriptionComponentProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handlePaymentSubmit = async (paymentData: StripePaymentData) => {
        setIsSubmitting(true);
        setCheckoutError(null);

        try {
            console.log("Processing payment with data:", paymentData);

            const subscriptionData : SubscriptionData = {
                paymentMethod: "stripe",
                paymentData,
                subscription: selectedSubscription,
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

            const updateStatusResponse = await fetch("/api/subscriptions/edit-status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        subscription_type: selectedSubscription?.plan_type,
                    }
                ),
            });

            if(!updateStatusResponse.ok) {
                const errorData = await updateStatusResponse.json();
                console.error("Failed to update subscription status:", errorData);
                setCheckoutError("Failed to update subscription status. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Redirect to order confirmation
            router.push(`/order-confirmation/${data.subscriptionId}`);
        } catch (error) {
            console.error("Payment error:", error);
            setCheckoutError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            {/* Checkout form */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                        {checkoutError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {checkoutError}
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

                <div className="lg:w-1/3">
                    <OrderSummary subscription={selectedSubscription} />
                </div>
            </div>
        </div>
    );
}