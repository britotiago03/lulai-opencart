// components/admin/signin/AdminSignInContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TokenValidationScreen from "./TokenValidationScreen";
import SignInForm from "./SignInForm";

export default function AdminSignInContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    // Check for redirect after successful auth
    useEffect(() => {
        if (session?.user?.isAdmin) {
            console.log("Already authenticated as admin, redirecting to dashboard");
            router.push("/admin");
        }
    }, [session, router]);

    const fromSetup = searchParams.get("from") === "setup";
    const signinToken = searchParams.get("signinToken");

    // Validate signin token if present
    useEffect(() => {
        if (!signinToken) return;

        const validateSigninToken = async () => {
            setValidatingToken(true);
            setError("");

            try {
                // First validate the token
                const response = await fetch(`/api/admin-auth/signin-token?token=${signinToken}`);
                const data = await response.json();

                if (!response.ok || !data.valid) {
                    setError(data.message || "Invalid or expired signin token");
                    setValidatingToken(false);
                    return;
                }

                // Mark the token as used and generate a new one
                const tokenResponse = await fetch('/api/admin-auth/signin-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ signinToken }),
                });

                const tokenData = await tokenResponse.json();

                if (!tokenResponse.ok || !tokenData.valid) {
                    setError(tokenData.message || "Invalid signin token");
                    setValidatingToken(false);
                    return;
                }

                // Set the email from the token validation
                setEmail(tokenData.email);

                // If there's a message about a new token, show it
                if (tokenData.message) {
                    setMessage(`${tokenData.message}. Please enter your password to continue.`);
                } else {
                    setMessage("Secure admin link verified. Please enter your password to continue.");
                }

                setValidatingToken(false);
            } catch (err) {
                console.error("Error validating signin token:", err);
                setError("Failed to validate signin token");
                setValidatingToken(false);
            }
        };

        void validateSigninToken();
    }, [signinToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Get CSRF token
            const csrfResponse = await fetch('/api/admin-auth/csrf');
            const { csrfToken } = await csrfResponse.json();

            // Directly call the admin-auth endpoint
            const response = await fetch('/api/admin-auth/callback/admin-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csrfToken,
                    email,
                    password,
                    callbackUrl: "/admin",
                    json: true
                }),
                credentials: 'include'
            });

            if (response.ok) {
                // Successful login
                router.push("/admin");
            } else {
                setError("Invalid admin credentials");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Admin login error:", error);
            setError("An error occurred during sign in");
            setIsLoading(false);
        }
    };

    // Show token validation screen during token verification
    if (validatingToken) {
        return <TokenValidationScreen error={error} />;
    }

    // Show regular login form
    return (
        <SignInForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            message={message}
            fromSetup={fromSetup}
            hasToken={!!signinToken}
        />
    );
}