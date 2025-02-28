"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [cartItemCount, setCartItemCount] = useState(0);

    // Extracted functions wrapped with useCallback to prevent unnecessary re-creation
    const fetchCartData = useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();

            if (data.cart) {
                setCartItemCount(data.cart.totalItems || 0);
            }
        } catch (error) {
            console.error("Error fetching cart data:", error);
            throw error; // Re-throw to allow the caller to catch it
        }
    }, []);

    const mergeCartAfterLogin = useCallback(async () => {
        try {
            await fetch('/api/cart/merge', { method: 'POST' });
            // Refresh cart count after merge
            await fetchCartData();
        } catch (error) {
            console.error("Error merging carts:", error);
            throw error; // Re-throw to allow the caller to catch it
        }
    }, [fetchCartData]); // Add fetchCartData as a dependency

    // Fetch cart data when component mounts and when session changes
    useEffect(() => {
        // Using IIFE to handle the async operation properly
        (async () => {
            try {
                await fetchCartData();
            } catch (error) {
                console.error("Error in initial cart data fetch:", error);
            }
        })();

        // Set up event listener for cart updates
        window.addEventListener('cart-updated', fetchCartData);

        return () => {
            window.removeEventListener('cart-updated', fetchCartData);
        };
    }, [session, fetchCartData]); // Add fetchCartData as a dependency

    // Function to merge carts after login
    useEffect(() => {
        // If session exists (user just logged in), try to merge carts
        if (session) {
            // Using IIFE to handle the async operation properly
            (async () => {
                try {
                    await mergeCartAfterLogin();
                } catch (error) {
                    console.error("Error in cart merge process:", error);
                }
            })();
        }
    }, [session, mergeCartAfterLogin]); // Add mergeCartAfterLogin as a dependency

    return (
        <nav className="flex justify-between p-4 bg-gray-800 text-white">
            <Link href="/" className="text-lg font-bold">My App</Link>

            <div className="flex gap-4 items-center">
                <Link href="/products" className="px-4 py-2 bg-gray-700 rounded">Products</Link>

                {/* Cart Icon with Item Count */}
                <Link href="/cart" className="relative px-4 py-2 bg-blue-600 rounded flex items-center">
                    <span className="mr-2">🛒</span> Cart
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </Link>

                {session ? (
                    <div className="flex items-center gap-4">
                        <p>Welcome, {session.user?.name}</p>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="bg-red-500 px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link href="/auth/login" className="px-4 py-2 bg-blue-500 rounded">Login</Link>
                        <Link href="/auth/signup" className="px-4 py-2 bg-green-500 rounded">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}