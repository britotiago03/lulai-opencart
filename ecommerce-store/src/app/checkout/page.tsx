"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/cart/useCart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { StripePaymentForm } from "@/components/checkout/payment/StripePaymentForm";
import { PayPalPaymentForm } from "@/components/checkout/payment/PayPalPaymentForm";
import { ManualPaymentForm } from "@/components/checkout/payment/ManualPaymentForm";
import { PaymentData } from "@/types/payment";

// Payment method types
export type PaymentMethod = 'stripe' | 'paypal' | 'manual';

// Customer information type
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
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Customer Info, 2: Payment
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const router = useRouter();

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

    if (cart.items.length === 0) {
        router.push('/cart');
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

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setPaymentMethod(method);
        setCheckoutError(null);
    };

    const clearCart = async () => {
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Update the cart state to reflect the empty cart
                await fetchCart();

                // Dispatch event to update other components (like navbar)
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
            // Continue with the flow even if cart clearing fails
        }
    };

    const handlePaymentSubmit = async (paymentData: PaymentData) => {
        setIsSubmitting(true);
        setCheckoutError(null);

        try {
            // Combined order and payment data
            const orderData = {
                customerInfo,
                paymentMethod,
                paymentData,
                cartItems: cart.items.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Submit order to appropriate API endpoint based on payment method
            const endpoint = `/api/checkout/${paymentMethod}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                setCheckoutError(data.error || 'Failed to process payment');
                setIsSubmitting(false);
                return;
            }

            // Clear the cart after successful order
            await clearCart();

            // Handle specific redirect requirements based on payment method
            if (paymentMethod === 'stripe' && data.redirectUrl) {
                // Redirect to Stripe checkout if needed
                window.location.href = data.redirectUrl;
                return;
            } else if (paymentMethod === 'paypal' && data.approvalUrl) {
                // Redirect to PayPal approval page
                window.location.href = data.approvalUrl;
                return;
            } else {
                // For manual payment or completed payments
                router.push(`/order-confirmation/${data.orderId}`);
            }
        } catch (error) {
            console.error("Payment error:", error);
            let errorMessage = "An unexpected error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setCheckoutError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {/* Checkout Steps Indicator */}
            <div className="mb-8">
                <div className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        checkoutStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                    }`}>
                        {checkoutStep > 1 ? '✓' : '1'}
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-300">
                        <div className={`h-full ${checkoutStep > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        checkoutStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-2">
                    <span>Customer Information</span>
                    <span>Payment</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Checkout Form Area */}
                <div className="lg:w-2/3">
                    {checkoutStep === 1 ? (
                        <CheckoutForm
                            customerInfo={customerInfo}
                            onSubmitAction={handleCustomerInfoSubmit}
                        />
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                            {checkoutError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {checkoutError}
                                </div>
                            )}

                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChangeAction={handlePaymentMethodChange}
                            />

                            <div className="mt-6">
                                {paymentMethod === 'stripe' && (
                                    <StripePaymentForm
                                        onSubmitAction={handlePaymentSubmit}
                                        isSubmitting={isSubmitting}
                                        amount={cart.totalPrice}
                                    />
                                )}

                                {paymentMethod === 'paypal' && (
                                    <PayPalPaymentForm
                                        onSubmitAction={handlePaymentSubmit}
                                        isSubmitting={isSubmitting}
                                        amount={cart.totalPrice}
                                    />
                                )}

                                {paymentMethod === 'manual' && (
                                    <ManualPaymentForm
                                        onSubmitAction={handlePaymentSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setCheckoutStep(1)}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                ← Back to Customer Information
                            </button>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <OrderSummary cart={cart} customerInfo={checkoutStep === 2 ? customerInfo : null} />
                </div>
            </div>
        </div>
    );
}