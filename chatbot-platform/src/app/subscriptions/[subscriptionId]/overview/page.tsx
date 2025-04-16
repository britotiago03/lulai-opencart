"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RetrievedSubscription } from "@/types/subscription";

export default function SubscriptionsOverviewPage() {
    const params = useParams<{ subscriptionId: string }>();
    const subscriptionId = params.subscriptionId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<RetrievedSubscription | null>(null);

    const router = useRouter();

    // Fetch subscription data with callback 
    const fetchSubscription = useCallback(async () => {
        if(!subscriptionId) {
            console.error("Subscription ID is missing");
            setLoading(false);
            return; 
        }
        
        try {     
            const response = await fetch(`/api/subscriptions/${subscriptionId}`);

            if(!response.ok) {
                setError("Failed to load subscription details");
                setLoading(false); 
                return;
            }

            const data = await response.json();
            setSubscription(data.subscription);

        } catch(error) {
            console.error("Error fetching subscirption:", error);
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setLoading(false); 
        }
    }, [subscriptionId]);

    // UseEffect with IIFE to avoid promise warning
    useEffect(() => {
        (async () => {
            await fetchSubscription();
        })();
    }, [fetchSubscription]);

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <header className="relative flex justify-center items-start w-full mb-16">
                <div className="absolute left-0 top-0">
                    <Image
                        src="/images/logo.png"
                        alt="LulAI Logo"
                        width={180}
                        height={38}
                        priority
                    />
                </div>
                <div className="flex flex-col items-center mt-4">
                    <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Subscriptions overview</p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                        Here you can look at your current subscription.
                    </p>
                </div>
            </header>
            {/* Info Box */}
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-2xl text-gray-500 font-bold mb-4 text-center">Subscription Overview</h1>
                <div className="border-b pb-4 mb-4">
                    <p className="text-lg text-gray-500 font-semibold">Plan Type: {subscription.plan_type}</p>
                    <p className="text-lg text-gray-500 font-semibold">Price: {subscription.price}</p>
                    <p className="text-lg text-gray-500 font-semibold">Status: {subscription.status}</p>
                    <p className="text-lg text-gray-500 font-semibold">Start Date: {formatDate(subscription.start_date)}</p>
                    <p className="text-lg text-gray-500 font-semibold">End Date: {formatDate(subscription.renewal_date)}</p>
                </div>
                <p className="text-gray-600 text-center">
                    Manage your subscription details and stay updated with your plan.
                </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={() => router.push("/subscriptions")}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                >
                    Change subscription
                </button>
            </div>
        </div>
    );
}