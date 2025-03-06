"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderSummary {
    id: string;
    date: string;
    status: string;
    total: number;
    items: number;
}

export default function OrdersPage() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication status
        if (status === "unauthenticated") {
            router.push("/auth/login?callbackUrl=/account/orders");
            return;
        }

        // Fetch orders when authenticated
        if (status === "authenticated") {
            void fetchOrders();
        }
    }, [status, router]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/account/orders");

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to fetch orders" }));
                setError(errorData.message || "Failed to load your orders. Please try again.");
                return;
            }

            const data = await response.json();
            setOrders(data.orders);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load your orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Helper function to get status badge style
    const getStatusBadgeClass = (status: string) => {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md mb-6">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => void fetchOrders()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-4">No Orders Found</h2>
                    <p className="text-gray-600 mb-6">
                        You haven&apos;t placed any orders yet.
                    </p>
                    <Link
                        href={`/products`}
                        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
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
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    #{order.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatDate(order.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
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
                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}