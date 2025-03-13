"use client";

import { Subscription } from "@/types/subscription";

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface SubscriptionComponentProps {
    subscription: Subscription | null;
}

export function OrderSummary({ subscription } : SubscriptionComponentProps) {

    return (
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Subscription info component */}
            <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">{subscription?.plan_type}</h3>
                <p className="text-lg font-semibold mb-4">{subscription?.price}</p>
            </div>            
        </div>
    );
}