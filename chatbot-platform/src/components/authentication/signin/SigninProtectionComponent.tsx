"use client";
import ToSigninButton  from "@/components/authentication/signin/ToSigninButton";

export default function SigninProtectionComponent() {
    return (
        <>
            <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
            Please sign in to access the dashboard page.
            </p>
            <ToSigninButton/>                        
        </>
    )
}