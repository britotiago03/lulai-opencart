"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/cart/useCart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { StripeProvider } from "@/components/checkout/payment/StripeProvider";
import { StripePaymentData } from "@/types/payment";

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

export default function CheckoutPage() {
    const { cart, loading, error, fetchCart } = useCart();
    const [checkoutStep, setCheckoutStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const router = useRouter();

    // Prevent redirection if an order was just placed
    const justPlacedOrder = typeof window !== "undefined" ? sessionStorage.getItem("justPlacedOrder") : null;

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>
                <p className="text-gray-500">Loading checkout information...</p>
            </div>
        );
    }

    if (error || !cart) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>
                <p className="text-red-500">{error || "Unable to load cart data"}</p>
            </div>
        );
    }

    // Only redirect to cart if an order was NOT just placed
    if (cart.items.length === 0 && justPlacedOrder !== "true") {
        router.push("/cart");
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>
                <p className="text-gray-500">Your cart is empty. Redirecting to cart page...</p>
            </div>
        );
    }

    const handleCustomerInfoSubmit = (info: CustomerInfo) => {
        setCustomerInfo(info);
        setCheckoutStep(2);
        window.scrollTo(0, 0);
    };

    const clearCart = async () => {
        try {
            const response = await fetch("/api/cart/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                await fetchCart();
                window.dispatchEvent(new Event("cart-updated"));
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    };

    const handlePaymentSubmit = async (paymentData: StripePaymentData) => {
        setIsSubmitting(true);
        setCheckoutError(null);

        try {
            console.log("Processing payment with data:", paymentData);

            const orderData = {
                customerInfo,
                paymentMethod: "stripe",
                paymentData,
                cartItems: cart.items.map((item) => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            const response = await fetch("/api/checkout/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                setCheckoutError(data.error || "Failed to process payment");
                setIsSubmitting(false);
                return;
            }

            console.log("Payment processed successfully:", data);

            // Set flag before clearing cart
            sessionStorage.setItem("justPlacedOrder", "true");

            await clearCart();

            // Redirect to order confirmation
            router.push(`/order-confirmation/${data.orderId}`);
        } catch (error) {
            console.error("Payment error:", error);
            setCheckoutError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {/* Checkout status/progress bar */}
            <div className="mb-8">
                <div className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        checkoutStep === 1 ? "bg-blue-600 text-white" : "bg-green-500 text-white"
                    }`}>
                        {checkoutStep > 1 ? "✓" : "1"}
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-300">
                        <div className={`h-full ${checkoutStep > 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        checkoutStep === 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
                    }`}>
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-2">
                    <span>Customer Information</span>
                    <span>Payment</span>
                </div>
            </div>
            
            {/* Main content: checkout form (step 1), order summary (step 2) */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    {checkoutStep === 1 ? (
                        <CheckoutForm customerInfo={customerInfo} onSubmitAction={handleCustomerInfoSubmit} />
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                            {checkoutError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {checkoutError}
                                </div>
                            )}

                            <div className="mt-6">
                                <StripeProvider
                                    onSubmitAction={handlePaymentSubmit}
                                    isSubmitting={isSubmitting}
                                    amount={cart.totalPrice}
                                />
                            </div>

                            <button type="button" onClick={() => setCheckoutStep(1)} className="mt-4 text-blue-600 hover:underline">
                                ← Back to Customer Information
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:w-1/3">
                    <OrderSummary cart={cart} customerInfo={checkoutStep === 2 ? customerInfo : null} />
                </div>
            </div>
        </div>
    );
}