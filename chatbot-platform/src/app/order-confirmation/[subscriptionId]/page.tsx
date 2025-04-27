"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RetrievedSubscription } from "@/types/subscription";
import { CheckCircle } from "lucide-react";

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
            <div className="min-h-screen bg-[#0f1729] text-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-4 text-lg">Loading subscription details...</p>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="min-h-screen bg-[#0f1729] text-white">
                <div className="container mx-auto p-6 pb-20">
                    <header className="flex justify-center mb-12">
                        <div className="flex flex-col items-center mt-8">
                            <Link href="/" className="flex items-center mb-8">
                                <span className="text-3xl font-bold text-white">LulAI</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-center">Subscription Confirmation</h1>
                        </div>
                    </header>
                    <main className="flex flex-col items-center mt-8">
                        <div className="bg-[#1b2539] p-6 rounded-lg shadow-md max-w-md w-full mb-6">
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md">
                                <p>{error || "Subscription not found"}</p>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <Link
                                    href={`/subscriptions`}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    View Subscription Plans
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
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

    // Capitalize plan type for display
    const capitalizedPlanType = subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1);

    return (
        <div className="min-h-screen bg-[#0f1729] text-white">
            <div className="container mx-auto p-6 pb-20">
                <header className="flex justify-center mb-12">
                    <div className="flex flex-col items-center mt-8">
                        <Link href="/" className="flex items-center mb-8">
                            <span className="text-3xl font-bold text-white">LulAI</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-center">Subscription Confirmed!</h1>
                    </div>
                </header>

                <main className="flex flex-col items-center mt-8">
                    <div className="bg-[#1b2539] rounded-lg shadow-md overflow-hidden max-w-2xl w-full">
                        <div className="bg-green-500/20 p-6 flex items-center justify-center border-b border-green-500/30">
                            <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
                            <h2 className="text-xl font-bold text-green-400">Thank You For Your Subscription</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg text-gray-300 font-bold">Subscription #{subscription.id}</h3>
                                    <p className="text-gray-400">{formatDate(subscription.created_at)}</p>
                                </div>
                                <div className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium">
                                    {subscription.status}
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-gray-300 font-medium mb-4">Subscription Details</h3>
                                <div className="space-y-3 pb-4 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Plan:</span>
                                        <span className="text-white font-semibold">{capitalizedPlanType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Amount:</span>
                                        <span className="text-white font-semibold">${subscription.price.toFixed(2)}/month</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Start Date:</span>
                                        <span className="text-white">{formatDate(subscription.start_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Renewal Date:</span>
                                        <span className="text-white">{formatDate(subscription.end_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link
                            href={`/dashboard/subscriptions`}
                            className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition text-center"
                        >
                            Manage Subscriptions
                        </Link>
                        <Link
                            href={`/dashboard`}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}