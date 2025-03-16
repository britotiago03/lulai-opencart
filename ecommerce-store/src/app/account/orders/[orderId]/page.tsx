"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
    imageUrl: string;
}

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface Order {
    id: string;
    status: string;
    dateCreated: string;
    customerInfo: CustomerInfo;
    items: OrderItem[];
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}

export default function OrderDetailPage() {
    const { status } = useSession();
    const router = useRouter();
    const params = useParams<{ orderId: string }>();
    const orderId = params?.orderId;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) {
            setError("Order ID is missing");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to fetch order details" }));
                setError(errorData.error || "An unexpected error occurred");
                return;
            }

            const data = await response.json();
            setOrder(data.order);
            setError(null);
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("An unexpected error occurred while fetching the order");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        // Check authentication status
        if (status === "unauthenticated") {
            router.push(`/auth/login?callbackUrl=/account/orders/${orderId || ""}`);
            return;
        }

        // Fetch order when authenticated
        if (status === "authenticated" && orderId) {
            void fetchOrder();
        }
    }, [status, orderId, router, fetchOrder]);

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Helper function for status badge styling
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

    if (error || !order) {
        return (
            <div>
                <div className="mb-4">
                    <Link href={`/account/orders`} className="text-blue-600 hover:text-blue-800">
                        ← Back to Orders
                    </Link>
                </div>
                <div className="bg-red-50 p-4 rounded-md mb-6">
                    <p className="text-red-600">{error || "Order not found"}</p>
                    <button
                        onClick={() => void fetchOrder()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <Link href={`/account/orders`} className="text-blue-600 hover:text-blue-800">
                    ← Back to Orders
                </Link>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="border-b p-6">
                    <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                    <p className="text-gray-600">Placed on {formatDate(order.dateCreated)}</p>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>

                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="py-4 flex flex-wrap md:flex-nowrap">
                                <div className="w-full md:w-20 h-20 relative flex-shrink-0 mb-4 md:mb-0">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 80px"
                                        className="object-contain"
                                    />
                                </div>
                                <div className="md:ml-6 flex-grow">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                        <p className="font-semibold">Total: ${item.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
                        <div className="bg-white p-4 rounded border">
                            <p className="font-medium">
                                {order.customerInfo.firstName} {order.customerInfo.lastName}
                            </p>
                            <p>{order.customerInfo.address}</p>
                            <p>
                                {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}
                            </p>
                            <p>{order.customerInfo.country}</p>
                            {order.customerInfo.phone && (
                                <p className="mt-2">{order.customerInfo.phone}</p>
                            )}
                            <p>{order.customerInfo.email}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Payment Information</h2>
                        <div className="bg-white p-4 rounded border mb-6">
                            <p>
                                <span className="font-medium">Method:</span>{" "}
                                {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                            </p>
                            <p>
                                <span className="font-medium">Status:</span>{" "}
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    order.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : order.paymentStatus === "refunded"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                }`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
                            </p>
                        </div>

                        <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
                        <div className="bg-white p-4 rounded border">
                            <div className="flex justify-between py-2">
                                <span>Subtotal:</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Shipping:</span>
                                <span>${order.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Tax:</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold">
                                <span>Total:</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}