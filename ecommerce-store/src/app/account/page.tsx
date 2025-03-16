"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserProfile } from "@/lib/userProfileService";

interface OrderSummary {
    id: string;
    date: string;
    status: string;
    total: number;
    items: number;
}

export default function AccountDashboard() {
    console.log("AccountDashboard rendering");

    // Get user profile data from service
    const { profile, isLoading: profileLoading } = useUserProfile();
    const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Log profile changes
    useEffect(() => {
        console.log("AccountDashboard profile changed:", profile);
    }, [profile]);

    // Fetch orders when profile changes
    useEffect(() => {
        console.log("AccountDashboard fetching orders");

        // Fetch recent orders
        const fetchRecentOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/account/orders");

                if (response.ok) {
                    const data = await response.json();
                    // Only take the latest 3 orders
                    setRecentOrders(data.orders.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching recent orders:", error);
            } finally {
                setLoading(false);
            }
        };

        // If we have profile data, fetch orders
        if (profile) {
            void fetchRecentOrders();
        }
    }, [profile]); // Only depend on profile

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to get status badge style
    const getStatusBadgeStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    // Show loading if either profile or orders are loading
    if (profileLoading || loading) {
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
                <p className="text-lg mb-4">Please log in to view your dashboard</p>
                <Link
                    href={`/auth/login`}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    Login
                </Link>
            </div>
        );
    }

    // Directly use profile.name and profile.email
    const profileName = profile.name;
    const profileEmail = profile.email;

    console.log("AccountDashboard rendering with name:", profileName);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Account Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Account Information</h2>
                    <p className="text-gray-700 mb-1">
                        <span className="font-medium">Name:</span> {profileName}
                    </p>
                    <p className="text-gray-700 mb-4">
                        <span className="font-medium">Email:</span> {profileEmail}
                    </p>
                    <Link
                        href={`/account/profile`}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href={`/account/orders`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                View All Orders
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/products`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Browse Products
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/cart`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                My Cart
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <Link
                        href={`/account/orders`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        View All
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
                        <Link
                            href={`/products`}
                            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(order.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.items}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="text-blue-600 hover:text-blue-900"
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
        </div>
    );
}