"use client"; // ✅ Runs only on the client

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function DynamicNavbar() {
    const { data: session } = useSession();
    const [cartItemCount, setCartItemCount] = useState(0);

    // ✅ Optimize API calls using useCallback()
    const fetchCartData = useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (data.cart) setCartItemCount(data.cart.totalItems || 0);
        } catch (error) {
            console.error("Error fetching cart data:", error);
        }
    }, []);

    // ✅ Use an async IIFE inside useEffect()
    useEffect(() => {
        (async () => {
            await fetchCartData();
        })();
    }, [fetchCartData]);

    return (
        <>
            {/* Cart */}
            <Link href={{ pathname: "/cart" }} className="relative px-4 py-2 bg-blue-600 rounded flex items-center">
                <span className="mr-2">🛒</span> Cart
                {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
            </Link>

            {/* User Authentication */}
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
                    <Link href={{ pathname: "/auth/login" }} className="px-4 py-2 bg-blue-500 rounded">Login</Link>
                    <Link href={{ pathname: "/auth/signup" }} className="px-4 py-2 bg-green-500 rounded">Sign Up</Link>
                </>
            )}
        </>
    );
}
