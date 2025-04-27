import React from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Subscription } from "@/types/subscription";

interface OrderSummaryProps {
    subscription: Subscription | null;
}

export function OrderSummary({ subscription }: OrderSummaryProps) {
    if (!subscription) {
        return null;
    }

    // Format plan type for display (capitalize first letter)
    const planType = subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1);

    // Get plan features based on subscription type
    const getPlanFeatures = () => {
        if (subscription.plan_type === "basic") {
            return [
                "Advanced Chatbot features",
                "Unlimited message history",
                "Increased interactions (1000/month)",
                "Detailed analytics",
                "Priority support"
            ];
        } else if (subscription.plan_type === "pro") {
            return [
                "All Basic features",
                "Unlimited interactions",
                "Advanced analytics & reporting",
                "Collaboration tools",
                "Multiple chatbots",
                "Enterprise-level support",
                "Custom integrations"
            ];
        }
        return [];
    };

    return (
        <div className="bg-[#1b2539] rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex items-center mb-6">
                    <ShoppingBag className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-bold text-white">Order Summary</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-300">{planType} Plan</span>
                        <span className="text-white">${subscription.price.toFixed(2)}/month</span>
                    </div>

                    {/* Benefits section */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Plan Benefits:</h3>
                        <ul className="space-y-2">
                            {getPlanFeatures().map((feature, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-400">
                                    <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between font-semibold">
                            <span className="text-gray-300">Total</span>
                            <span className="text-white">${subscription.price.toFixed(2)}/month</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            You&apos;ll be billed monthly. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}