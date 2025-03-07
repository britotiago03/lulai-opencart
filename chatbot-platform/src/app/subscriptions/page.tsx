"use client";

import Image from "next/image";

export default function SubscriptionsPage() {
    return (
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
            <header className="relative flex justify-center items-start w-full">
                {/* Image positioned absolutely to the top-left */}
                <div className="absolute left-0 top-0">
                    <Image
                        src="/lulAI_logo.png"
                        alt="Next.js logo"
                        width={180}
                        height={38}
                        priority
                    />
                </div>
                

                {/* Centered text */}
                <div className="flex flex-col items-center mt-4">
                    <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Subscriptions page</p>
                    <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                        Here you can choose your subscriptions.
                    </p>
                </div>
            </header>
            <main className="flex flex-col gap-8 items-center sm:items-center row-start-2">
                {/* Add your main content here */}
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
                <p>LulAI Inc. &copy;</p>
            </footer>
        </div>
    );
}