"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSessionProvider from "./AdminSessionProvider";
import Image from "next/image";
import AdminLoginForm from "./AdminLoginForm";

interface AdminLoginPageProps {
    securePath: string;
}

// Using destructuring without assignment to ignore the parameter completely
function AdminLoginContent({securePath}: AdminLoginPageProps) {
    const router = useRouter();
    const params = useSearchParams();
    const key = params.get("key");
    const [isValidKey, setIsValidKey] = useState<boolean | null>(null);

    // Ensure the key is not null or undefined and is a valid key
    useEffect(() => {
        const verifyKey = async () => {
            if (!key) {
                setIsValidKey(false);
                return;
            }

            try {
                const response = await fetch('/api/admin/verify-access', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accessKey: key,
                        path: securePath
                    })
                });

                if (!response.ok) {
                    setIsValidKey(false);
                    return;
                }

                const data = await response.json();
                setIsValidKey(data.verified === true);
            } catch (error) {
                console.error("Verification error:", error);
                setIsValidKey(false);
            }
        };

        verifyKey();
    }, [key, securePath]);

    if (isValidKey === false) {
        // This will trigger the 404 page
        router.replace('/404');
        router.refresh();
        return null;
    }

    if (isValidKey === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4">Verifying access...</p>
                </div>
            </div>
        );
    }    


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row w-full max-w-4xl">
                {/* Basic page information */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:mr-32">
                    <Image
                        src="/lulAI_logo.png"
                        alt="Next.js logo"
                        width={180 * 2}
                        height={38 * 2}
                        priority
                    />
                    <p className="font-[family-name:var(--font-dm-sans)] text-center text-gray-500 max-w-4xl mt-4">
                        Our AI-powered chatbot is designed to revolutionize your in-store shopping experience. With a wide range of capabilities, it serves
                        as your virtual in-store expert, providing valuable assistance
                        to both retailers and customers. Here's what our
                        chatbot can do.
                    </p>
                </div>

                {/* Admin Login Form */}
                <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:ml-32 mt-4 md:mt-0">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-4">
                            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Admin login page</h1>
                        </div>
                        <div className="relative w-full">
                            <AdminLoginForm securePath={securePath} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrap the login page with our custom Admin Session Provider
export default function AdminLoginPage({ securePath }: AdminLoginPageProps) {
    return (
        <AdminSessionProvider>
            <AdminLoginContent securePath={securePath} />
        </AdminSessionProvider>
    );
}