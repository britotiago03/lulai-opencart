"use client";

import Link from "next/link";
import { Cart } from "@/types/cart";

interface CartSummaryProps {
    cart: Cart;
    onCheckoutAction: () => void;
}

export function CartSummary({ cart, onCheckoutAction }: CartSummaryProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                        <span>Estimated Total</span>
                        <span>${cart.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onCheckoutAction}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded w-full transition"
            >
                Proceed to Checkout
            </button>

            <div className="mt-4">
                <Link href="/products" className="text-blue-600 hover:underline inline-block">
                    ← Continue Shopping
                </Link>
            </div>
        </div>
    );
}