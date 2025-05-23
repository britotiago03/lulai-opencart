"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav, useMobileNav } from "@/components/dashboard/MobileNav";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);
    const { isOpen, isMobile, toggleAction } = useMobileNav();

    // Check for subscription status
    useEffect(() => {
        async function checkSubscription() {
            try {
                const response = await fetch('/api/subscriptions/check');
                const data = await response.json();

                if (!data.hasActiveSubscription) {
                    // Redirect to subscriptions page if no active subscription
                    router.push('/subscriptions');
                    return;
                }

                setSubscriptionChecked(true);
                setLoading(false);
            } catch (error) {
                console.error('Error checking subscription:', error);
                // On error, still allow access to dashboard
                setSubscriptionChecked(true);
                setLoading(false);
            }
        }

        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated") {
            if (session?.user?.role === "admin") {
                router.push("/admin");
                return;
            }

            // Check for subscription
            if (!subscriptionChecked) {
                void checkSubscription();
            }
        }
    }, [session, status, router, subscriptionChecked]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#0f1729]">
            {/* Mobile Nav Toggle */}
            {isMobile && <MobileNav isOpen={isOpen} toggleAction={toggleAction} />}

            {/* Mobile Sidebar Overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleAction}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - either fixed or hidden on mobile */}
            <div
                className={`${
                    isMobile
                        ? `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
                            isOpen ? "translate-x-0" : "-translate-x-full"
                        }`
                        : "sticky top-0 h-screen w-64 flex-shrink-0"
                }`}
            >
                <Sidebar onClose={toggleAction} />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#0f1729] text-white">
                {/* This padding is only needed on mobile when the navbar toggle is shown */}
                {isMobile && <div className="h-14"></div>}
                {children}
            </main>
        </div>
    );
}