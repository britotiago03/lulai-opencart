"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to change password");
                return;
            }

            // Success
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect after a delay to show success message
            setTimeout(() => {
                router.push("/account/profile");
            }, 2000);

        } catch (err) {
            console.error("Error changing password:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link href={`/account/profile`} className="text-blue-600 hover:text-blue-800">
                    ← Back to Profile
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Change Password</h1>

            {success ? (
                <div className="bg-green-50 p-4 rounded-md mb-6 text-green-800">
                    Password changed successfully! Redirecting to your profile...
                </div>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-50 p-4 rounded-md mb-6 text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                                disabled={loading}
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className={`w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                                    loading ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}