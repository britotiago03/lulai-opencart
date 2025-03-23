"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAdminEvents } from "@/hooks/admin/useAdminEvents";
import { toast } from "react-hot-toast";
import { OrderEventData } from "@/app/api/events/route";

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    recentOrders: Array<{
        id: string;
        status: string;
        total_amount: number;
        created_at: string;
        customer_name: string;
        customer_email: string;
    }>;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(new Set());
    const statsRef = useRef<DashboardStats | null>(null);

    // Sync the ref with state for accessing in callback
    useEffect(() => {
        statsRef.current = stats;
    }, [stats]);

    // Function to fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            console.log("[Dashboard] Fetching dashboard data...");
            const response = await fetch("/api/admin/dashboard");

            if (!response.ok) {
                // Safely handle error response
                let errorMessage = "Failed to fetch dashboard data";
                try {
                    const errorData = await response.json();
                    if (errorData?.error) {
                        errorMessage = errorData.error;
                    }
                } catch (jsonError) {
                    console.error("Error parsing error response:", jsonError);
                }

                setError(errorMessage);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("[Dashboard] Dashboard data fetched successfully");
            setStats(data);

            // Store all existing order IDs to prevent duplicates
            const orderIds = new Set<string>();
            data.recentOrders.forEach((order: { id: string }) => {
                orderIds.add(order.id);
            });
            setProcessedOrderIds(orderIds);

            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching dashboard data:", err);
            setLoading(false);
        }
    }, []);

    // Handler for new order events
    const handleNewOrder = useCallback((orderData: OrderEventData) => {
        console.log("[Dashboard] Received new order event:", orderData);

        // Prevent duplicate processing
        if (processedOrderIds.has(orderData.id)) {
            console.log(`[Dashboard] Order ${orderData.id} already processed, skipping`);
            return;
        }

        // Show a toast notification
        toast.success(`New order #${orderData.id} received!`, {
            duration: 5000,
            position: 'top-right',
        });

        // Add to processed IDs set
        setProcessedOrderIds(prev => {
            const newSet = new Set(prev);
            newSet.add(orderData.id);
            return newSet;
        });

        // Update stats with the new order
        setStats(prevStats => {
            if (!prevStats) return null;

            // Create a new order entry to add to recent orders
            const newOrder = {
                id: orderData.id,
                status: orderData.status || 'processing',
                total_amount: orderData.total,
                created_at: orderData.date || new Date().toISOString(),
                customer_name: orderData.customer.name,
                customer_email: orderData.customer.email
            };

            // Increase order count
            const totalOrders = prevStats.totalOrders + 1;

            // Add to the beginning of recent orders and keep only the first 10
            const recentOrders = [newOrder, ...prevStats.recentOrders].slice(0, 10);

            console.log(`[Dashboard] Updating dashboard with new order ${orderData.id}`);

            return {
                ...prevStats,
                totalOrders,
                recentOrders
            };
        });
    }, [processedOrderIds]);

    // Set up admin events listener with our callback
    const { connected, error: eventError } = useAdminEvents({
        onNewOrder: handleNewOrder
    });

    // Initial data fetch
    useEffect(() => {
        console.log("[Dashboard] Component mounted, fetching initial data");

        let isMounted = true; // Track component mount state

        const loadDashboardData = async () => {
            try {
                if (isMounted) {
                    await fetchDashboardData();
                    console.log("[Dashboard] Data loaded successfully");
                }
            } catch (error) {
                if (isMounted) {
                    console.error("[Dashboard] Error loading dashboard data:", error);
                }
            }
        };

        void loadDashboardData(); // Use void to explicitly handle the promise

        return () => {
            isMounted = false; // Prevent state updates after unmount
            console.log("[Dashboard] Component unmounting");
        };
    }, [fetchDashboardData]);

    // Handle manual refresh
    const handleManualRefresh = async () => {
        try {
            await fetchDashboardData();
            toast.success("Dashboard refreshed", { duration: 2000 });
        } catch (error) {
            console.error("[Dashboard] Error refreshing dashboard:", error);
            toast.error("Failed to refresh dashboard", { duration: 2000 });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-red-800 text-white p-4 rounded-md">
                <p>{error || "Failed to load dashboard data"}</p>
                <button
                    onClick={handleManualRefresh}
                    className="mt-4 bg-white text-red-800 px-4 py-2 rounded hover:bg-gray-100"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Format date function
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

                <div className="flex items-center space-x-4">
                    {/* Manual refresh button */}
                    <button
                        onClick={handleManualRefresh}
                        className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>

                    {/* Real-time status indicator */}
                    <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-300">
                            {connected ? 'Real-time updates active' : 'Connecting...'}
                        </span>
                        {eventError && (
                            <span className="ml-2 text-xs text-red-400">
                                (Connection issue)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-2">
                    Welcome back, {session?.user?.name || "Admin"}
                </h2>
                <p className="text-blue-100">
                    Here&apos;s what&apos;s happening with your store today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Products"
                    count={stats.totalProducts}
                    icon="📦"
                    linkHref="/admin/products"
                    linkText="Manage Products"
                    color="bg-purple-600"
                />
                <StatCard
                    title="Orders"
                    count={stats.totalOrders}
                    icon="🛍️"
                    linkHref="/admin/orders"
                    linkText="View Orders"
                    color="bg-green-600"
                />
                <StatCard
                    title="Users"
                    count={stats.totalUsers}
                    icon="👥"
                    linkHref="/admin/users"
                    linkText="Manage Users"
                    color="bg-yellow-600"
                />
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>

                {stats.recentOrders.length === 0 ? (
                    <p className="text-gray-400">No recent orders found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {stats.recentOrders.map((order) => (
                                <tr key={order.id} className="transition-all">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <div>{order.customer_name}</div>
                                        <div className="text-gray-500 text-xs">{order.customer_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        ${order.total_amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionButton
                        title="Add New Product"
                        href="/admin/products/new"
                        color="bg-blue-600 hover:bg-blue-700"
                    />
                    <QuickActionButton
                        title="Process Orders"
                        href="/admin/orders"
                        color="bg-green-600 hover:bg-green-700"
                    />
                    <QuickActionButton
                        title="Manage Inventory"
                        href="/admin/inventory"
                        color="bg-purple-600 hover:bg-purple-700"
                    />
                    <QuickActionButton
                        title="View Store"
                        href="/"
                        color="bg-gray-600 hover:bg-gray-700"
                        external
                    />
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    count: number;
    icon: string;
    linkHref: string;
    linkText: string;
    color: string;
}

function StatCard({ title, count, icon, linkHref, linkText, color }: StatCardProps) {
    return (
        <div className={`${color} rounded-lg p-6 shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white text-opacity-80 text-sm">{title}</p>
                    <p className="text-white text-3xl font-bold mt-1">{count}</p>
                </div>
                <div className="text-4xl opacity-80">{icon}</div>
            </div>
            <div className="mt-4">
                <Link
                    href={linkHref}
                    className="text-white text-opacity-90 hover:text-opacity-100 text-sm font-medium"
                >
                    {linkText} →
                </Link>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let bgColor = "bg-gray-700 text-gray-100";

    switch (status.toLowerCase()) {
        case "completed":
            bgColor = "bg-green-700 text-green-100";
            break;
        case "processing":
            bgColor = "bg-blue-700 text-blue-100";
            break;
        case "shipped":
            bgColor = "bg-purple-700 text-purple-100";
            break;
        case "cancelled":
            bgColor = "bg-red-700 text-red-100";
            break;
        case "pending":
            bgColor = "bg-yellow-700 text-yellow-100";
            break;
    }

    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

interface QuickActionButtonProps {
    title: string;
    href: string;
    color: string;
    external?: boolean;
}

function QuickActionButton({ title, href, color, external = false }: QuickActionButtonProps) {
    return (
        <Link
            href={href}
            className={`${color} text-white py-3 px-4 rounded-lg text-center shadow transition-colors`}
            target={external ? "_blank" : undefined}
        >
            {title}
            {external && " ↗"}
        </Link>
    );
}