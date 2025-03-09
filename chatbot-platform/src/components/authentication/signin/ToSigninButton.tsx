"use client";
import { useRouter } from "next/navigation";

export default function ToSigninButton() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center">
            <button 
                className="w-full p-2 text-white bg-black rounded-lg h-12 hover:bg-gray-700"
                onClick={() => router.push("/auth/signin")}>
                Sign In
            </button>
        </div>
    );
}