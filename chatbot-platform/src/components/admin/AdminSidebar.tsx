// src/components/admin/AdminSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Users,
    CreditCard,
    MessageSquare,
    BarChart3,
    Settings,
    Home,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
    onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleExpand = (key: string) => {
        if (expanded === key) {
            setExpanded(null);
        } else {
            setExpanded(key);
        }
    };

    // Navigation items
    const sidebarNavItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: Home,
        },
        {
            title: "User Management",
            href: "/admin/users",
            icon: Users,
        },
        {
            title: "Subscriptions",
            href: "/admin/subscriptions",
            icon: CreditCard,
        },
        {
            title: "Chatbots",
            href: "/admin/chatbots",
            icon: MessageSquare,
        },
        {
            title: "Analytics",
            href: "/admin/analytics",
            icon: BarChart3,
        },
        {
            title: "System Alerts",
            href: "/admin/alerts",
            icon: ShieldAlert,
        },
        {
            title: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="h-full bg-[#1b2539] text-white flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center p-4 h-14 border-b border-[#2c3e50] bg-[#1b2539]">
                <Link href="/admin" className="flex items-center">
                    <div className="h-8 w-8 bg-blue-600 flex items-center justify-center rounded-md mr-2">
                        <span className="font-bold text-white">L</span>
                    </div>
                    <span className="font-bold text-xl">LuIAI Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto">
                <nav className="px-2 py-4">
                    <ul className="space-y-1">
                        {sidebarNavItems.map((item, index) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose && onClose()}
                                        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                                            isActive
                                                ? "bg-blue-600/20 text-blue-400"
                                                : "text-gray-400 hover:bg-[#232b3c] hover:text-white"
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-[#2c3e50]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
                        <div className="ml-2">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-gray-500">admin@luiai.com</p>
                        </div>
                    </div>
                    <button
                        className="p-1 rounded-md hover:bg-[#232b3c] text-gray-400 hover:text-white"
                        onClick={() => {
                            // Replace with actual logout logic
                            console.log("Logging out...");
                            window.location.href = "/auth/login";
                        }}
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}