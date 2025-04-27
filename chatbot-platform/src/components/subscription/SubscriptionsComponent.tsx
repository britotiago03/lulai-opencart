"use client";

import { useSession } from "next-auth/react";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SubscriptionsComponent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    // Prevent users from accessing the subscriptions page if they are not signed in
    useEffect(() => {
        if(status === "loading") return;

        if(!session) {
            router.replace("/auth/signin");
        } else {
            setIsLoggedIn(true);
        }
    }, [session, status, router]);

    if(isLoggedIn === null || status === "loading") {
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
                        <h1 className="text-3xl font-bold text-center">Choose Your Plan</h1>
                        <p className="text-gray-400 mt-2 text-center max-w-2xl">
                            Select the subscription plan that best fits your needs.
                        </p>
                    </div>
                </header>
                <main className="flex flex-col gap-8 items-center mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                        <SubscriptionCard
                            title="Free"
                            description="Good for side or hobby projects"
                            price_desc="$0/month"
                            price={0}
                            type="free"
                        />
                        <SubscriptionCard
                            title="Basic"
                            description="Enhanced AI functionalities"
                            price_desc="$20/month"
                            price={20}
                            type="basic"
                        />
                        <SubscriptionCard
                            title="Pro"
                            description="Perfect for organizations"
                            price_desc="$49/month"
                            price={49}
                            type="pro"
                        />
                    </div>
                </main>
                <footer className="mt-16 text-center text-gray-400">
                    <p>LulAI Inc. &copy; {new Date().getFullYear()}</p>
                </footer>
            </div>
        </div>
    );
}