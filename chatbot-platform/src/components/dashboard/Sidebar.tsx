// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    MessageSquare,
    BarChart2,
    MessageCircle,
    Code,
    Users,
    Mail,
    Bell,
    Settings
} from "lucide-react";

interface SidebarProps {
    onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`);
    };

    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/dashboard/chatbots", label: "Agents", icon: MessageSquare },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/dashboard/conversations", label: "Conversations", icon: MessageCircle },
        { href: "/dashboard/integrations", label: "Integrations", icon: Code },
    ];

    const personalItems = [
        { href: "/dashboard/teams", label: "Teams", icon: Users },
        { href: "/dashboard/messages", label: "Messages", icon: Mail },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
        { href: "/dashboard/settings", label: "Setting", icon: Settings },
    ];

    // Handle mobile navigation click
    const handleNavClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="w-64 h-full bg-[#0f1729] text-white flex flex-col">
            <div className="p-4 border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center" onClick={handleNavClick}>
                    <h1 className="text-2xl font-bold">LuIAI</h1>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="py-2 px-3 text-sm font-medium text-gray-400 mt-2">
                    Working space
                </div>

                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleNavClick}
                                className={`flex items-center px-3 py-2 rounded-md group transition-colors ${
                                    isActive(item.href)
                                        ? "bg-black text-white"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 ${
                                        isActive(item.href)
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-gray-300"
                                    }`}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="py-2 px-3 text-sm font-medium text-gray-400 mt-6">
                    Personal
                </div>

                <nav className="space-y-1 px-2">
                    {personalItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleNavClick}
                                className={`flex items-center px-3 py-2 rounded-md group transition-colors ${
                                    isActive(item.href)
                                        ? "bg-black text-white"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 ${
                                        isActive(item.href)
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-gray-300"
                                    }`}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-600 mr-2">
                        {/* User avatar placeholder */}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Amanda Goldberg</p>
                        <p className="text-xs text-gray-400">View profile</p>
                    </div>
                    <button className="ml-auto">
                        <Settings className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}