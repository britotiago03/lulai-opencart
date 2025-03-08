"use client";

import { useSession } from "next-auth/react";
import SubscriptionCard from "@/components/SubscriptionCard";
import Image from "next/image";
import SigninProtectionComponent from "./SigninProtectionComponent";


export default function SubscriptionsComponent() {
    const { data: session } = useSession();

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
                    <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Subscriptions page</p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                        Here you can choose your subscriptions.
                    </p>
                </div>
            </header>

            { session ? (
                <main className="flex flex-col gap-8 items-center sm:items-center row-start-2 mt-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <SubscriptionCard
                            title="Free"
                            description="Good for side or hobby projects"
                            price="$0/month"
                            type="free"
                        />
                        <SubscriptionCard
                            title="Basic"
                            description="Enhanced AI functionalities"
                            price="$20/month"
                            type="basic"
                        />
                         <SubscriptionCard
                            title="Pro"
                            description="Perfect for organizations"
                            price="$49/month"
                            type="pro"
                        />
                    </div>
                </main>
                ) : (
                    <main className="flex flex-col gap-8 items-center sm:items-center row-start-2 mt-16">
                        <SigninProtectionComponent/>
                    </main>
                )
            }
            
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
                <p>LulAI Inc. &copy;</p>
            </footer>
        </div>
    )
}