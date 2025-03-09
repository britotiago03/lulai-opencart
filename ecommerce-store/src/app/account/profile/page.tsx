"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
}

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user) return;

            try {
                setLoading(true);
                const res = await fetch("/api/account/profile");

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.profile);
                    setName(data.profile.name || "");
                } else {
                    // If we don't have a profile yet, set name from session
                    setName(session.user.name || "");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                // Use session data as fallback
                setName(session.user.name || "");
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setUpdating(true);

        try {
            const res = await fetch("/api/account/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                // Update session with new name - this is critical for navbar update
                await update({ name });

                setMessage({ text: "Profile updated successfully", type: "success" });
            } else {
                const errorData = await res.json();
                setMessage({ text: errorData.error || "Failed to update profile", type: "error" });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: "An unexpected error occurred", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                            <input
                                type="email"
                                id="email"
                                value={profile?.email || session?.user?.email || ""}
                                className="w-full p-2 border rounded-md bg-gray-100"
                                disabled
                                title="Email cannot be changed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {profile?.subscriptionStatus && (
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