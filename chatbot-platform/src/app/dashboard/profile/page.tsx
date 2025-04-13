// src/app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User, LogOut, Settings, Bell, Lock } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated") {
            setLoading(false);
        }
    }, [session, status, router]);

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            {/* Profile Information */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{session?.user?.name || "User"}</h2>
                            <p className="text-gray-400">{session?.user?.email || "No email"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#232b3c] rounded-lg">
                            <div className="flex items-center mb-2">
                                <User className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="font-medium">Account Type</span>
                            </div>
                            <p className="text-gray-300">{session?.user?.role || 'Client'}</p>
                        </div>

                        <div className="p-4 bg-[#232b3c] rounded-lg">
                            <div className="flex items-center mb-2">
                                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="font-medium">Notification Status</span>
                            </div>
                            <p className="text-gray-300">Enabled</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-duration-200">
                    <button className="w-full" onClick={() => {}}>
                        <CardContent className="p-4 flex items-center cursor-pointer">
                            <Settings className="h-5 w-5 text-blue-500 mr-2" />
                            <span>Account Settings</span>
                        </CardContent>
                    </button>
                </Card>

                <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-duration-200">
                    <button className="w-full" onClick={() => {}}>
                        <CardContent className="p-4 flex items-center cursor-pointer">
                            <Lock className="h-5 w-5 text-blue-500 mr-2" />
                            <span>Change Password</span>
                        </CardContent>
                    </button>
                </Card>

                <Card className="bg-red-900/20 border border-red-900/30 hover:bg-red-900/30 transition-duration-200">
                    <button className="w-full" onClick={handleLogout}>
                        <CardContent className="p-4 flex items-center cursor-pointer">
                            <LogOut className="h-5 w-5 text-red-400 mr-2" />
                            <span className="text-red-400">Log Out</span>
                        </CardContent>
                    </button>
                </Card>
            </div>
        </div>
    );
}