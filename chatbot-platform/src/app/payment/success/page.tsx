"use client";

import ToDashboardButton from "@/components/dashboard/ToDashboardButton";
import Image from "next/image";

export default function CheckoutSuccessPage() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
              <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
                <Image
                  src="/images/logo.png"
                  alt="LulAI Logo"
                  width={180 * 2}
                  height={38 * 2}
                  priority
                />
                <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                   Payment successful. Click the button below to return to the home page.
                </p>
                <ToDashboardButton/>
              </main>
              <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
                <p>LulAI Inc. &copy;</p>
              </footer>
            </div>
    );
}