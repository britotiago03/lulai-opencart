// src/components/admin-dashboard/AdminSidebar.tsx
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    BarChart2,
    MessageSquare,
    MessageCircle,
    Bell,
    Settings,
    Layout,
    LogOut,
    CreditCard,
} from "lucide-react";
import { useAdminLogout } from "@/hooks/useAdminLogout";

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { logout } = useAdminLogout();

    const handleSignOut = async () => {
        // Show a loading indicator or message if desired
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
            // Force a hard reload to homepage as last resort
            window.location.href = "/";
        }
    };

    const links = [
        { name: "Dashboard", href: "/admin", icon: Layout, exactMatch: true },
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
        { name: "Chatbots", href: "/admin/chatbots", icon: MessageSquare },
        { name: "Conversations", href: "/admin/conversations", icon: MessageCircle },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
        { name: "System Alerts", href: "/admin/alerts", icon: Bell },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const isActive = (path: string, exactMatch = false) => {
        if (exactMatch) {
            return pathname === path;
        }
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1729] text-white border-r border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link href={`/admin`} className="flex items-center space-x-2">
                    <span className="font-bold text-xl">LulAI Admin</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-4">
                    <div className="space-y-1">
                        {links.map((link) => {
                            const LinkIcon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        isActive(link.href, link.exactMatch)
                                            ? "bg-[#1D2739] text-white"
                                            : "text-gray-300 hover:bg-[#1D2739] hover:text-white"
                                    }`}
                                >
                                    <LinkIcon className="mr-3 h-5 w-5" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-8">
                        <div className="mt-2 space-y-1">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-[#1D2739] hover:text-white"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}