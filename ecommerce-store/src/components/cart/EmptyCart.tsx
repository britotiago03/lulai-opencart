"use client";

import Link from "next/link";

export function EmptyCart() {
    return (
        <div className="bg-gray-100 rounded-lg p-8 max-w-2xl mx-auto">
            <p className="text-xl mb-4">Your cart is empty</p>
            <p className="mb-6 text-gray-600">Looks like you haven&apos;t added any products to your cart yet.</p>
            <Link href={`/products`} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                Continue Shopping
            </Link>
        </div>
    );
}