"use client";

import Image from "next/image";
import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
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
                            <AdminLoginForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}