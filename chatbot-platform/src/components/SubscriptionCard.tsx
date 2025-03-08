"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
    title: string;
    description: string; 
    price: string;
    type: "free" | "basic" | "pro";
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({title, description, price, type}) => {
    const router = useRouter();

    const handleSubscribe = () => {
        if (type === "free") {
            router.push("/dashboard");
        } else {
            router.push("/checkout");
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl text-gray-600 font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className="text-gray-600 font-semibold">{price}</p>
            

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
                <p>something went wrong with lsiting types</p>
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
