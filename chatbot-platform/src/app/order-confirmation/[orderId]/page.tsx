"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Order {
    id: string;
    status: string;
    dateCreated: string;
    customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    items: Array<{
        id: number;
        name: string;
        price: number;
        quantity: number;
        total: number;
    }>;
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}

export default function OrderConfirmationPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);

    /** ✅ Function to clear the cart and refresh UI */
    const clearCart = useCallback(async () => {
        try {
            const response = await fetch("/api/cart/clear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Failed to clear cart:", await response.text());
                return;
            }

            console.log("Cart cleared successfully");

            // Dispatch a custom event to update the Navbar cart
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    }, []);

    /** ✅ Fetch Order Function with useCallback */
    const fetchOrder = useCallback(async () => {
        if (!orderId) return;

        try {
            setLoading(true);

            // Fetch order details
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                setError("Failed to load order details");
                setLoading(false);
                return;
            }

            const data = await response.json();
            setOrder(data.order);

            // ✅ Clear the cart after successful order
            await clearCart();
        } catch (error) {
            console.error("Error fetching order:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [orderId, clearCart]);

    /** ✅ UseEffect with IIFE to avoid promise warning */
    useEffect(() => {
        (async () => {
            await fetchOrder();
        })();
    }, [fetchOrder]);

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Loading Order Details</h1>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Order Confirmation</h1>
                <div className="bg-red-100 p-4 rounded-md mb-6 text-left">
                    <p className="text-red-600">{error || "Order not found"}</p>
                </div>
                <Link href={`/products`} className="text-blue-600 hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // Format the date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-green-100 p-6 rounded-lg text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Thank You For Your Order!</h1>
                    <p className="text-green-700">Your order has been received and is being processed.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Order #{order.id}</h2>
                            <p className="text-gray-600">{formatDate(order.dateCreated)}</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                            {order.status}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-medium mb-4">Order Items</h3>
                        <div className="divide-y">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-3 flex justify-between">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600 text-sm">
                                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-medium">${item.total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <Link href={`/account/orders`} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center">
                        View All Orders
                    </Link>
                    <Link href={`/products`} className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition text-center">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}