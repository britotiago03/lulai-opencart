"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserProfile } from "@/lib/userProfileService";

export default function ProfilePage() {
    // Get user profile data from service
    const { profile, isLoading, updateName } = useUserProfile();
    const [name, setName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [updating, setUpdating] = useState(false);
    const [changingEmail, setChangingEmail] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [showEmailChange, setShowEmailChange] = useState(false);

    // Update the name input field when profile data changes
    useEffect(() => {
        if (profile?.name) {
            setName(profile.name);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setUpdating(true);

        try {
            const success = await updateName(name);

            if (success) {
                setMessage({ text: "Profile updated successfully", type: "success" });
            } else {
                setMessage({ text: "Failed to update profile", type: "error" });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: "An unexpected error occurred", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setChangingEmail(true);

        try {
            const response = await fetch('/api/account/change-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail, currentPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message, type: "success" });
                setNewEmail("");
                setCurrentPassword("");
                setShowEmailChange(false);
            } else {
                setMessage({ text: data.error || "Failed to initiate email change", type: "error" });
            }
        } catch (error) {
            console.error("Error changing email:", error);
            setMessage({ text: "An unexpected error occurred", type: "error" });
        } finally {
            setChangingEmail(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If no profile data, user is not logged in
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-lg mb-4">Please log in to view your profile</p>
                <Link
                    href={`/auth/login`}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-600"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="email"
                                    id="email"
                                    value={profile.email}
                                    className="w-full p-2 border rounded-md bg-gray-100"
                                    disabled
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmailChange(!showEmailChange)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {showEmailChange && (
                            <div className="border p-4 rounded-md bg-white">
                                <h3 className="text-md font-medium mb-3">Change Email Address</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="newEmail"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
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
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEmailChange(false);
                                                setNewEmail("");
                                                setCurrentPassword("");
                                            }}
                                            className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEmailChange}
                                            disabled={changingEmail}
                                            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                                                changingEmail ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {changingEmail ? "Saving..." : "Save New Email"}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    After changing your email, you&apos;ll receive a verification link at your new address.
                                    You&apos;ll need to click that link to complete the process.
                                </p>
                            </div>
                        )}

                        {profile.subscriptionStatus && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subscription Status
                                </label>
                                <div className="p-2 bg-gray-100 border rounded-md">
                                    {profile.subscriptionStatus.charAt(0).toUpperCase() + profile.subscriptionStatus.slice(1)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">Security</h2>
                    <p className="text-gray-600 mb-4">Manage your password and account security</p>
                    <Link
                        href={`/account/change-password`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Change Password
                    </Link>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                            updating ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        disabled={updating}
                    >
                        {updating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}