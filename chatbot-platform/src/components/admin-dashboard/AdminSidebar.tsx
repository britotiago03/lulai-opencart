// src/components/admin.dashboard/AdminSidebar.tsx
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
    Database,
    User,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/admin", icon: Layout },
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Chatbots", href: "/admin/chatbots", icon: MessageSquare },
        { name: "Conversations", href: "/admin/conversations", icon: MessageCircle },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
        { name: "System Alerts", href: "/admin/alerts", icon: Bell },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1729] text-white border-r border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link href="/admin" className="flex items-center space-x-2">
                    <Image
                        src="/images/logo.png"
                        alt="LulAI Logo"
                        width={36}
                        height={36}
                        className="w-9 h-9"
                    />
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
                                        isActive(link.href)
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