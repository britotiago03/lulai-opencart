// src/components/dashboard/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BarChart2, MessageSquare, Layers, Settings, LogOut, CreditCard } from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Agents", href: "/dashboard/agents", icon: Users },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
        { name: "Integrations", href: "/dashboard/integrations", icon: Layers },
    ];

    const personalLinks = [
        { name: "Subscription", href: "/dashboard/subscriptions", icon: CreditCard },
        { name: "Settings", href: "/dashboard/profile", icon: Settings },
    ];

    const isActive = (path: string) => {
        // Special case for the dashboard home
        if (path === "/dashboard") {
            return pathname === "/dashboard";
        }

        // For other routes, check if the pathname starts with the path
        return pathname.startsWith(`${path}/`) || pathname === path;
    };

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1729] text-white border-r border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link href={`/dashboard`} className="flex items-center space-x-2">
                    <span className="font-bold text-xl">LulAI</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-4">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Working space
                        </p>
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
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Personal
                        </p>
                        <div className="mt-2 space-y-1">
                            {personalLinks.map((link) => {
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