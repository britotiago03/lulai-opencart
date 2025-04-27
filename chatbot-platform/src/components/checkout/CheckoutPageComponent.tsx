"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import CheckoutComponent from "./CheckoutComponent";
import { Subscription } from "@/types/subscription";

export default function CheckoutPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    // Prevent users from accessing the checkout page if they are not signed in
    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.replace("/auth/signin");
        } else {
            const price = searchParams.get("price");
            const type = searchParams.get("type");

            if (price && type) {
                // Validate the plan type before setting it
                const validPlanType = validatePlanType(type);

                if (validPlanType) {
                    setSelectedSubscription({
                        plan_type: validPlanType,
                        price: parseFloat(price),
                    });
                } else {
                    // Invalid plan type, redirect to subscriptions page
                    console.error(`Invalid plan type: ${type}`);
                    router.replace("/subscriptions");
                    return;
                }
            } else {
                router.replace("/subscriptions");
                return;
            }
            setIsLoggedIn(true);
        }
    }, [session, status, router, searchParams]);

    // Helper function to validate and type-cast the plan type
    const validatePlanType = (type: string): 'free' | 'basic' | 'pro' | null => {
        if (type === 'free' || type === 'basic' || type === 'pro') {
            return type;
        }
        return null;
    };

    if (isLoggedIn === null || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f1729] text-white">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-4 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1729] text-white">
            <div className="container mx-auto p-6 pb-20">
                <header className="flex justify-center mb-12">
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-8">
                            <Link href="/" className="flex items-center">
                                <span className="text-3xl font-bold text-white">LulAI</span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-center">Checkout</h1>
                        <p className="text-gray-400 mt-2 text-center max-w-2xl">
                            Complete your purchase to get started
                        </p>
                    </div>
                </header>

                <main className="flex flex-col items-center mt-8">
                    {selectedSubscription && (
                        <div className="bg-[#1b2539] rounded-lg p-6 shadow-md max-w-md w-full mb-8">
                            <h2 className="text-xl font-bold mb-4 text-white">Order Summary</h2>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-300">{selectedSubscription.plan_type.charAt(0).toUpperCase() + selectedSubscription.plan_type.slice(1)} Plan</span>
                                <span className="text-white font-medium">${selectedSubscription.price}/month</span>
                            </div>
                            <div className="border-t border-gray-700 my-4"></div>
                            <div className="flex justify-between">
                                <span className="text-gray-300 font-semibold">Total</span>
                                <span className="text-white font-bold">${selectedSubscription.price}/month</span>
                            </div>
                        </div>
                    )}

                    <CheckoutComponent selectedSubscription={selectedSubscription} />

                    <div className="mt-8 text-center">
                        <Link href={`/subscriptions`} className="text-blue-500 hover:text-blue-400">
                            ← Back to plans
                        </Link>
                    </div>
                </main>

                <footer className="mt-16 text-center text-gray-400">
                    <p>LulAI Inc. &copy; {new Date().getFullYear()}</p>
                </footer>
            </div>
        </div>
    );
}