"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import SignupForm from "@/components/authentication/signup/SignupForm";
import SigninForm from "@/components/authentication/signin/SigninForm";
import { SessionProvider } from "next-auth/react";
import GoogleSigninButton from "@/components/google/GoogleSigninButton";
import GoogleSignupButton from "@/components/google/GoogleSignupButton";


export default function AuthPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [isSignUp, setIsSignUp] = useState(pathname === "/auth/signup");

    useEffect(() => {
        if (isSignUp) {
            router.push("/auth/signup");
        } else {
            router.push("/auth/signin");
        }
    }, [isSignUp, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row w-full max-w-4xl">
                {/* Basic page information */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:mr-32">
                    <Image
                        src="/images/logo.png"
                        alt="LulAI Logo"
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

                {/* Sign Up / Sign In Form */}
                <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:ml-32 mt-4 md:mt-0">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-4">
                            <button
                                className={`w-1/2 p-2 ${isSignUp ? "bg-black text-white" : "bg-gray-300 text-white"} rounded-l-lg h-12`}
                                onClick={() => setIsSignUp(true)}
                            >
                                Sign Up
                            </button>
                            <button
                                className={`w-1/2 p-2 ${!isSignUp ? "bg-black text-white" : "bg-gray-300 text-white"} rounded-r-lg h-12`}
                                onClick={() => setIsSignUp(false)}
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="relative w-full mb-8">
                            {isSignUp ? <SignupForm /> : <SigninForm />}
                        </div>
                        <div className="relative w-full">
                            {isSignUp ? 
                                (<SessionProvider>
                                    <GoogleSignupButton/>
                                </SessionProvider>) :
                                (<SessionProvider>
                                    <GoogleSigninButton />
                                </SessionProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}