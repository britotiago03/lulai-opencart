"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export default function CheckSubscriptionPage() {
    const { status } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true; // For cleanup/prevent state updates after unmount

        async function checkSubscriptionStatus() {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                router.push("/auth/signin");
                return;
            }

            try {
                // Check if user has an active subscription
                const response = await fetch('/api/subscriptions/check');

                // Only update state if component is still mounted
                if (!isMounted) return;

                if (!response.ok) {
                    console.error(`Subscription check failed with status: ${response.status}`);
                    const errorText = await response.text();
                    console.error(`Error details: ${errorText}`);
                    setError('Failed to check subscription status. Please try again.');

                    // On error, redirect to subscription page to be safe
                    setTimeout(() => {
                        if (isMounted) {
                            router.push('/subscriptions');
                        }
                    }, 3000);
                    return;
                }

                const data = await response.json();
                console.log('Subscription check response:', data);

                if (data.hasActiveSubscription) {
                    // Redirect to dashboard if they have an active subscription
                    router.push('/dashboard');
                } else {
                    // Redirect to subscription page if no active subscription
                    router.push('/subscriptions');
                }
            } catch (error) {
                // Only update state if component is still mounted
                if (!isMounted) return;

                console.error('Error checking subscription:', error);
                setError('Failed to check subscription status. Please try again.');

                // On error, redirect to subscription page to be safe
                setTimeout(() => {
                    if (isMounted) {
                        router.push('/subscriptions');
                    }
                }, 3000); // Give the user a chance to see the error
            }
        }

        void checkSubscriptionStatus();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [status, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1729] flex items-center justify-center p-4">
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-xl font-bold text-center">{error}</h2>
                    </div>
                    <p className="text-gray-400 text-center mb-6">
                        Redirecting to subscription page...
                    </p>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <LoadingSkeleton />;
}