"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export default function AdminComponent() {
    const { data: session } = useSession();

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
              <Image
                src="/lulAI_logo.png"
                alt="Next.js logo"
                width={180 * 2}
                height={38 * 2}
                priority
              />
              { session ? (
                <>
                 <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Welcome to the lulAI platform admin dashboard page! </p>
                 <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                    Our AI-powered chatbot is designed to revolutionize your in-store 
                    shopping experience. With a wide range of capabilities, it serves 
                    as your virtual in-store expert, providing valuable assistance 
                    to both retailers and customers.
                 </p>
                </> 
              ) : (
                <>
                    <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
                    Please sign in to access the dashboard page.
                    </p>
                </>
              )



              }
              
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
              <p>LulAI Inc. &copy;</p>
            </footer>
        </div>
    )
}