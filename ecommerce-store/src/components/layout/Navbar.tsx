"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isHydrated, setIsHydrated] = useState(false);

    // Mark when hydration is complete to prevent mismatch
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Extracted functions wrapped with useCallback to prevent unnecessary re-creation
    const fetchCartData = useCallback(async () => {
        if (!isHydrated) return;

        try {
            const res = await fetch('/api/cart');
            const data = await res.json();

            if (data.cart) {
                setCartItemCount(data.cart.totalItems || 0);
            }
        } catch (error) {
            console.error("Error fetching cart data:", error);
        }
    }, [isHydrated]);

    const mergeCartAfterLogin = useCallback(async () => {
        if (!isHydrated || !session) return;

        try {
            await fetch('/api/cart/merge', { method: 'POST' });
            // Refresh cart count after merge
            await fetchCartData();
        } catch (error) {
            console.error("Error merging carts:", error);
        }
    }, [fetchCartData, isHydrated, session]);

    // Fetch cart data when component mounts and when session changes
    useEffect(() => {
        if (!isHydrated) return;

        // Use an async function inside useEffect and call it immediately
        const fetchData = async () => {
            await fetchCartData();
        };

        fetchData().catch(console.error);

        // Set up event listener for cart updates
        const handleCartUpdate = async () => {
            await fetchCartData();
        };

        window.addEventListener('cart-updated', handleCartUpdate);

        return () => {
            window.removeEventListener('cart-updated', handleCartUpdate);
        };
    }, [isHydrated, fetchCartData]);

    // Function to merge carts after login
    useEffect(() => {
        if (!isHydrated) return;

        // If session exists (user just logged in), try to merge carts
        if (session) {
            // Use an async function inside useEffect and call it immediately
            const mergeCart = async () => {
                await mergeCartAfterLogin();
            };

            mergeCart().catch(console.error);
        }
    }, [session, mergeCartAfterLogin, isHydrated]);

    return (
        <nav className="flex justify-between p-4 bg-gray-800 text-white">
            <Link href={`/`} className="text-lg font-bold">My App</Link>

            <div className="flex gap-4 items-center">
                <Link href={`/products`} className="px-4 py-2 bg-gray-700 rounded">Products</Link>

                {/* Only render dynamic content after hydration to prevent mismatch */}
                {isHydrated && (
                    <>
                        {/* Cart Icon with Item Count */}
                        <Link href={`/cart`} className="relative px-4 py-2 bg-blue-600 rounded flex items-center">
                            <span className="mr-2">🛒</span> Cart
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded">
                                        {session.user?.name} <span>▼</span>
                                    </button>
                                    <div className="absolute right-0 w-48 mt-2 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block">
                                        <Link href={`/account`} className="block px-4 py-2 hover:bg-gray-100">
                                            Dashboard
                                        </Link>
                                        <Link href={`/account/orders`} className="block px-4 py-2 hover:bg-gray-100">
                                            My Orders
                                        </Link>
                                        <Link href={`/account/profile`} className="block px-4 py-2 hover:bg-gray-100">
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: `/auth/login` })}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href={`/auth/login`} className="px-4 py-2 bg-blue-500 rounded">Login</Link>
                                <Link href={`/auth/signup`} className="px-4 py-2 bg-green-500 rounded">Sign Up</Link>
                            </>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}