"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
    title: string;
    description: string; 
    price_desc: string;
    price: number;
    type: "free" | "basic" | "pro";
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({title, description, price_desc, price, type}) => {
    const router = useRouter();

    const handleSubscribe = async () => {
        // TODO: Edit to inplement change of subscription status here
        // Edit user subscription status here

        try {
            if (type === "free") {
                const response = await fetch("/api/subscriptions/edit-status", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        {
                            subscription_type: type
                        }
                    )
                });

                if(!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to update subscription status:", errorData);
                    alert("Failed to update subscription. Please try again.");
                    return;
                }

                router.push("/dashboard");
            } else {
                router.push(`/checkout?price=${price}&type=${type}`);
            }
        } catch(error) {
            console.error("Error during subscription update:", error);
            alert("An error occurred. Please try again.");
        }
    }

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
                    <li>Enterprise-level support</li>
                </ul>
            )
            : (
                <p>something went wrong with listing types</p>
            )
            }

            <button 
                className="px-6 py-3 text-white bg-black rounded-lg hover:bg-gray-700"
                onClick={handleSubscribe}
            >
                Select
            </button>
        </div>
    );
};

export default SubscriptionCard;
