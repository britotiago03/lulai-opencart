"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestDashboard() {
    const router = useRouter();
    const { data : session, status} = useSession();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    // Redirect to 404 page if user is not logged in
    useEffect(() => {
        if (status === "loading") return;
        
        if (!session) {
            router.replace("/auth/signin");
        } else {
            setIsLoggedIn(true);
        }
    }, [session, status, router]);

    if (isLoggedIn === null || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    
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
            <p className="font-[family-name:var(--font-geist-mono)] text-black text-center">Welcome to the lulAI platform dashboard page guest user! </p>
            <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
              Our AI-powered chatbot is designed to revolutionize your in-store 
              shopping experience. With a wide range of capabilities, it serves 
              as your virtual in-store expert, providing valuable assistance 
              to both retailers and customers.
            </p>
          </main>
          <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
            <p>LulAI Inc. &copy;</p>
          </footer>
        </div>
    )
}