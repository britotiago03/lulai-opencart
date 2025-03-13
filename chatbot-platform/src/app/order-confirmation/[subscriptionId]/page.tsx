"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RetrievedSubscription } from "@/types/subscription";

interface Subscription {
    id: number;
    user_id: number;
    plan_type: string;
    price: number;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
    customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

export default function OrderConfirmationPage() {
    const params = useParams<{ subscriptionId: string }>();
    const subscriptionId = params.subscriptionId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<RetrievedSubscription | null>(null);

    /* Fetch Subscription Function with useCallback */
    const fetchSubscription = useCallback(async () => {
        if (!subscriptionId) return;

        try {
            setLoading(true);

            // Fetch subscription details
            const response = await fetch(`/api/subscriptions/${subscriptionId}`);
            if (!response.ok) {
                setError("Failed to load subscription details");
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSubscription(data.subscription);

        } catch (error) {
            console.error("Error fetching subscription:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [subscriptionId]);

    /* UseEffect with IIFE to avoid promise warning */
    useEffect(() => {
        (async () => {
            await fetchSubscription();
        })();
    }, [fetchSubscription]);

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Loading Subscription Details</h1>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Subscription Confirmation</h1>
                <div className="bg-red-100 p-4 rounded-md mb-6 text-left">
                    <p className="text-red-600">{error || "Subscription not found"}</p>
                </div>
                <Link href={`/subscriptions`} className="text-blue-600 hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // Format the date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-green-100 p-6 rounded-lg text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Thank You For Your Subscription!</h1>
                    <p className="text-green-700">Your subscription has been received and is being processed.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl text-gray-500 font-bold">Subscription #{subscription.id}</h2>
                            <p className="text-gray-600">{formatDate(subscription.created_at)}</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                            {subscription.status}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-gray-500 font-medium mb-4">Subscription Details</h3>
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-gray-500 font-semibold mb-2">{subscription.plan_type}</h3>
                            <p className="text-gray-500 font-semibold mb-4">${subscription.price.toFixed(2)}</p>
                            <p className="text-gray-500 mb-4">Start Date: {formatDate(subscription.start_date)}</p>
                            <p className="text-gray-500 mb-4">End Date: {formatDate(subscription.end_date)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4">
                     {/* TODO: Create a view for all Subscriptions page */}
                    <Link href={`/account/subscriptions`} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center">
                        View All Subscriptions
                    </Link>
                    <Link href={`/dashboard`} className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition text-center">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}