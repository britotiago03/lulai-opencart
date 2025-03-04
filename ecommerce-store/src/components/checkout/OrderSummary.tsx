"use client";

import { Cart } from "@/types/cart";

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

interface OrderSummaryProps {
    cart: Cart;
    customerInfo: CustomerInfo | null;
}

export function OrderSummary({ cart, customerInfo }: OrderSummaryProps) {
    // Calculate shipping cost
    const shippingCost = 5.99;

    // Calculate tax (assuming 8% tax rate)
    const taxRate = 0.08;
    const taxAmount = cart.totalPrice * taxRate;

    // Calculate total with shipping and tax
    const orderTotal = cart.totalPrice + shippingCost + taxAmount;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="border-b pb-4 mb-4">
                <div className="max-h-60 overflow-y-auto">
                    {cart.items.map((item) => (
                        <div key={item.cart_item_id} className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                                <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">
                                    {item.quantity}
                                </span>
                                <span className="text-sm truncate" style={{ maxWidth: '180px' }}>{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold">${item.item_total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t mt-3">
                    <span className="font-bold">Order Total</span>
                    <span className="font-bold">${orderTotal.toFixed(2)}</span>
                </div>
            </div>

            {customerInfo && (
                <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-700">{customerInfo.firstName} {customerInfo.lastName}</p>
                    <p className="text-sm text-gray-700">{customerInfo.address}</p>
                    <p className="text-sm text-gray-700">
                        {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}
                    </p>
                    <p className="text-sm text-gray-700">{customerInfo.country}</p>
                    <p className="text-sm text-gray-700 mt-2">{customerInfo.email}</p>
                    <p className="text-sm text-gray-700">{customerInfo.phone}</p>
                </div>
            )}
        </div>
    );
}