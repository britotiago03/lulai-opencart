"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
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
                setSelectedSubscription({
                    plan_type: type,
                    price: parseFloat(price),
                });
            } else {
                router.replace("/subscriptions");
            }
            setIsLoggedIn(true);
        }
    }, [session, status, router, searchParams]);

    if (isLoggedIn === null || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
            <header className="relative flex justify-center items-start w-full">
                <div className="absolute left-0 top-0">
                    <Image
                        src="/lulAI_logo.png"
                        alt="Next.js logo"
                        width={180}
                        height={38}
                        priority
                    />
                </div>
                <div className="flex flex-col items-center mt-4">
                    <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Checkout</p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                        Checkout your items here
                    </p>
                </div>
            </header>
            <main className="flex flex-col gap-8 items-center sm:items-center row-start-2 mt-16 text-gray-500">
                {selectedSubscription && (
                    <div className="border p-4 rounded-lg bg-white shadow-md max-w-md w-full mb-8">
                        <h2 className="text-xl font-bold mb-2">Selected subscription</h2>
                        <h2 className="text-xl font-bold mb-2">{selectedSubscription.plan_type}</h2>
                        <p className="text-lg font-semibold mb-4">{selectedSubscription.price}</p>
                    </div>
                )}
                <CheckoutComponent selectedSubscription={selectedSubscription} />
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
                <p>LulAI Inc. &copy;</p>
            </footer>
        </div>
    );
}