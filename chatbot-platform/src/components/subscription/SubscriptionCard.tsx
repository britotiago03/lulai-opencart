"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface SubscriptionCardProps {
    title: string;
    description: string;
    price_desc: string;
    price: number;
    type: "free" | "basic" | "pro";
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({title, description, price_desc, price, type}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (type === "free") {
            try {
                setIsLoading(true);
                setError(null);

                // Create free subscription
                const response = await fetch('/api/subscriptions/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        plan_type: 'free',
                        price: 0
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    // Use a safer way to extract error message
                    const errorMessage = data && typeof data.error === 'string'
                        ? data.error
                        : 'Failed to create free subscription';

                    setError(errorMessage);
                    setIsLoading(false);
                    return;
                }

                setIsLoading(false);

                // Redirect to dashboard
                router.push("/dashboard");
            } catch (error) {
                // Safely handle the error object
                console.error('Error:', error);
                setIsLoading(false);

                // More robust error handling
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to activate free plan. Please try again.';

                setError(errorMessage);
            }
        } else {
            router.push(`/checkout?price=${price}&type=${type}`);
        }
    }

    // Determine feature list based on subscription type
    const getFeatures = () => {
        if (type === "free") {
            return [
                "Basic Chatbot",
                "30 days message history",
                "Limited interactions (100/month)",
                "Basic analytics"
            ];
        } else if (type === "basic") {
            return [
                "Advanced Chatbot features",
                "Unlimited message history",
                "Increased interactions (1000/month)",
                "Detailed analytics",
                "Priority support"
            ];
        } else if (type === "pro") {
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

    // Determine card highlight (popular plan, etc.)
    const isHighlighted = type === "basic";

    return (
        <div className={`flex flex-col bg-[#1b2539] rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-[1.02] ${
            isHighlighted ? 'border-2 border-blue-500 relative' : ''
        }`}>
            {isHighlighted && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 uppercase rounded-bl-lg">
                    Popular
                </div>
            )}

            <div className="p-6 flex-grow">
                <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
                <p className="text-gray-400 mb-4">{description}</p>
                <p className="text-3xl font-bold mb-5 text-white">{price_desc}</p>

                <div className="space-y-3 mb-6">
                    {getFeatures().map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="p-6 pt-0">
                <button
                    className={`w-full py-3 px-6 rounded-md transition duration-200 font-semibold ${
                        type === "pro"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : type === "basic"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "border border-blue-500 text-blue-500 hover:bg-blue-500/10"
                    }`}
                    onClick={handleSubscribe}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        type === "free" ? "Get Started" : "Select Plan"
                    )}
                </button>
            </div>
        </div>
    );
};

export default SubscriptionCard;