"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        access_token_renewal_frequency: "weekly",
        admin_email: "",
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [regeneratingToken, setRegeneratingToken] = useState(false);

    useEffect(() => {
        // Define the fetch function
        async function fetchSettings() {
            try {
                const response = await fetch("/api/admin/settings");
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data.settings);
                } else {
                    setMessage({
                        type: "error",
                        text: "Failed to load settings. Server returned an error.",
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                setMessage({
                    type: "error",
                    text: "Failed to load settings. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        }

        // Call the fetch function
        fetchSettings().catch(error => {
            console.error("Unexpected error in fetchSettings:", error);
            setMessage({
                type: "error",
                text: "An unexpected error occurred while loading settings.",
            });
            setLoading(false);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            const responseData = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: "Settings saved successfully.",
                });
            } else {
                setMessage({
                    type: "error",
                    text: responseData.error || "Failed to save settings",
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to save settings",
            });
        } finally {
            setSaving(false);
        }
    };

    const regenerateAccessToken = async () => {
        if (!confirm("Are you sure you want to regenerate the admin access token? All admins will receive an email with the new access details.")) {
            return;
        }

        setRegeneratingToken(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/regenerate-access-token", {
                method: "POST",
            });

            const responseData = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: "Access token regenerated successfully. All admins have been notified via email.",
                });
            } else {
                setMessage({
                    type: "error",
                    text: responseData.error || "Failed to regenerate access token",
                });
            }
        } catch (error) {
            console.error("Error regenerating access token:", error);
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to regenerate access token",
            });
        } finally {
            setRegeneratingToken(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Admin Settings</h1>

            {message && (
                <div
                    className={`p-4 mb-6 rounded-md ${
                        message.type === "success" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="access_token_renewal_frequency" className="block text-sm font-medium text-gray-300 mb-1">
                        Access Token Renewal Frequency
                    </label>
                    <select
                        id="access_token_renewal_frequency"
                        name="access_token_renewal_frequency"
                        value={settings.access_token_renewal_frequency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-400">
                        How often the secure admin access URL and key should be regenerated
                    </p>
                </div>

                {session?.user?.isSuperAdmin && (
                    <div>
                        <label htmlFor="admin_email" className="block text-sm font-medium text-gray-300 mb-1">
                            Primary Admin Email
                        </label>
                        <input
                            type="email"
                            id="admin_email"
                            name="admin_email"
                            value={settings.admin_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-400">
                            The email address that will receive initial setup information if the system is reset
                        </p>
                    </div>
                )}

                <div className="pt-5 flex justify-between items-center">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            saving ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>

                    <button
                        type="button"
                        onClick={regenerateAccessToken}
                        disabled={regeneratingToken}
                        className={`px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                            regeneratingToken ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {regeneratingToken ? "Regenerating..." : "Regenerate Access Token Now"}
                    </button>
                </div>
            </form>
        </div>
    );
}