"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, RefreshCcw } from "lucide-react";
import { RetrievedSubscription } from "@/types/subscription";

export default function DashboardSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<RetrievedSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                setLoading(true);
                const response = await fetch("/api/subscriptions/user");

                if (response.ok) {
                    const data = await response.json();
                    setSubscriptions(data.subscriptions || []);
                    setError(null);
                } else {
                    setError("Failed to fetch subscriptions.");
                }
            } catch (err) {
                console.error("Error fetching subscriptions:", err);
                setError(err instanceof Error ? err.message : "Unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }

        void fetchSubscriptions();
    }, []);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex items-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-4 text-lg">Loading your subscriptions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg text-red-400 mb-4">{error}</p>
                <Link
                    href={`/dashboard`}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8">Your Subscriptions</h1>

            {subscriptions.length === 0 ? (
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-6">You don&apos;t have any active subscriptions yet.</p>
                    <Link
                        href={`/subscriptions`}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    >
                        View Plans
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {subscriptions.map((subscription) => {
                        const isCancelled = subscription.status === "cancelled";

                        return (
                            <div
                                key={subscription.id}
                                className={`rounded-lg shadow-md p-6 flex flex-col md:flex-row md:justify-between md:items-center
                ${isCancelled ? "bg-[#391b1b]" : "bg-[#1b2539]"}`
                                }
                            >
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <CreditCard className={`h-8 w-8 ${isCancelled ? "text-red-500" : "text-blue-500"}`} />
                                    <div>
                                        <p className="text-lg font-bold capitalize">{subscription.plan_type} Plan</p>
                                        <p className="text-gray-400">${subscription.price.toFixed(2)}/month</p>
                                    </div>
                                </div>

                                <div className="text-center md:text-right">
                                    <p className="text-gray-400 text-sm">Started: {formatDate(subscription.start_date)}</p>
                                    <p className="text-gray-400 text-sm">Renewal: {formatDate(subscription.end_date)}</p>

                                    <div className="mt-3 flex flex-col items-center md:items-end gap-2">
                    <span
                        className={`px-3 py-1 text-xs rounded-full
                      ${isCancelled ? "bg-red-600/20 text-red-400" : "bg-green-600/20 text-green-400"}`}
                    >
                      {subscription.status}
                    </span>

                                        {!isCancelled && (
                                            <Link
                                                href={`/subscriptions`}
                                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition"
                                            >
                                                <RefreshCcw className="h-4 w-4" />
                                                Change Plan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
