"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
    title: string;
    description: string; 
    price_desc: string;
    price: number;
    type: "free" | "basic" | "pro" | "enterprise";
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ title, description, price_desc, price, type }) => {
    const router = useRouter();
    const [isSelected, setIsSelected] = useState(false); // State to track if the subscription is selected
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        // Fetch the user's current subscription status
        const fetchSubscriptionStatus = async () => {
            try {
                const response = await fetch("/api/users/data");
                if (!response.ok) {
                    console.error("Failed to fetch subscription status");
                    return;
                }

                const userData = await response.json();
                // Check if the current subscription type matches this card's type
                setIsSelected(userData.subscription_status === type);
            } catch (error) {
                console.error("Error fetching subscription status:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchSubscriptionStatus();
    }, [type]);

    const handleSubscribe = async () => {
        if (isSelected) return; // Prevent action if already selected

        try {
            if (type === "free") {
                // Check if the user already has an active subscription
            const subscriptionStatusResponse = await fetch("/api/users/data", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!subscriptionStatusResponse.ok) {
                const errorData = await subscriptionStatusResponse.json();
                console.error("Failed to fetch subscription status:", errorData);
                alert("Failed to fetch subscription status. Please try again.");
                return;
            }

            const userData = await subscriptionStatusResponse.json();
            const hasActiveSubscription = userData.subscription_status && userData.subscription_status !== "none";

            let response;

            if (hasActiveSubscription) {
                // Update existing subscription
                console.log("Updating existing subscription...");
                response = await fetch("/api/subscriptions/change", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subscription_type: type,
                        price: price,
                    }),
                });
            } else {
                // Create a new subscription
                console.log("Creating new subscription...");
                response = await fetch("/api/subscriptions/new", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        plan_type: type,
                        plan_price: price,
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to process subscription:", errorData);
                alert("Failed to process subscription. Please try again.");
                return;
            }

            // Update user subscription status to free
            const editResponse = await fetch("/api/subscriptions/edit-status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subscription_type: type,
                }),
            });
            if (!editResponse.ok) {
                const errorData = await response.json();
                console.error("Failed to update subscription status:", errorData);
                alert("Failed to update subscription. Please try again.");
                return;
            }
                router.push("/dashboard");
            } else {
                router.push(`/checkout?price=${price}&type=${type}`);
            }
        } catch (error) {
            console.error("Error during subscription update:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl text-gray-600 font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className="text-gray-600 font-semibold">{price_desc}</p>

            {type === "free" ? (
                <ul className="text-gray-600 list-disc list-inside">
                    <li>Basic Chatbot</li>
                    <li>30 days history</li>
                    <li>Limited interactions</li>
                </ul>
            ) : type === "basic" ? (
                <ul className="text-gray-600 list-disc list-inside">
                    <li>Advanced features</li>
                    <li>Unlimited messages</li>
                    <li>Increased interactions</li>
                </ul>
            ) : type === "pro" ? (
                <ul className="text-gray-600 list-disc list-inside">
                    <li>Collaboration features</li>
                    <li>Smart analytics</li>
                </ul>
            ) : type === "enterprise" ? (
                <ul className="text-gray-600 list-disc list-inside">
                    <li>Advanced analytics</li>
                    <li>Enterprise-level support</li>
                </ul>
            ) : (
                <p>Something went wrong with listing types</p>
            )}

            <button
                className={`px-6 py-3 rounded-lg ${
                    isSelected
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-700"
                }`}
                onClick={handleSubscribe}
                disabled={isSelected || loading} // Disable button if selected or loading
            >
                {loading ? "Loading..." : isSelected ? "Selected" : "Select"}
            </button>
        </div>
    );
};

export default SubscriptionCard;