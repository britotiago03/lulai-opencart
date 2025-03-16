"use client";

import { useState, useEffect } from "react";
import { Cart } from "@/types/cart";

export function useCart() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [updateMessages, setUpdateMessages] = useState<Record<number, { type: 'success' | 'error', message: string }>>({});

    // Fetch cart data
    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            setCart(data.cart);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setError("Failed to load cart data");
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: number, productId: number, newQuantity: number) => {
        setUpdating(prev => ({ ...prev, [itemId]: true }));

        try {
            const res = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    quantity: newQuantity
                }),
            });

            const data = await res.json();

            if (data.success) {
                // If quantity is 0, the item is removed, so we don't need a success message
                if (newQuantity > 0) {
                    setUpdateMessages(prev => ({
                        ...prev,
                        [itemId]: { type: 'success', message: 'Updated successfully' }
                    }));
                }

                // Refresh cart data
                await fetchCart();

                // Trigger cart update event for navbar
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                setUpdateMessages(prev => ({
                    ...prev,
                    [itemId]: { type: 'error', message: data.error || 'Update failed' }
                }));
            }
        } catch (error) {
            console.error("Error updating cart:", error);
            setUpdateMessages(prev => ({
                ...prev,
                [itemId]: { type: 'error', message: 'Network error' }
            }));
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));

            // Clear message after 3 seconds
            setTimeout(() => {
                setUpdateMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[itemId];
                    return newMessages;
                });
            }, 3000);
        }
    };

    // Remove item from cart
    const removeItem = async (itemId: number, productId: number) => {
        await updateQuantity(itemId, productId, 0);
    };

    useEffect(() => {
        // Using IIFE (Immediately Invoked Function Expression) to handle the promise
        (async () => {
            try {
                await fetchCart();
            } catch (err) {
                console.error("Failed to load cart during initialization:", err);
            }
        })();
    }, []);

    return {
        cart,
        loading,
        error,
        updating,
        updateMessages,
        updateQuantity,
        removeItem,
        fetchCart
    };
}