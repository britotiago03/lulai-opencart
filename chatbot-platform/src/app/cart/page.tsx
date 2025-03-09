"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/cart/useCart";
import { CartTable } from "@/components/cart/CartTable";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";

export default function CartPage() {
    const {
        cart,
        loading,
        error,
        updating,
        updateMessages,
        updateQuantity,
        removeItem
    } = useCart();
    const router = useRouter();

    // Define Server Actions (with proper naming)
    const onUpdateQuantityAction = async (itemId: number, productId: number, newQuantity: number) => {
        try {
            await updateQuantity(itemId, productId, newQuantity);
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const onRemoveAction = async (itemId: number, productId: number) => {
        try {
            await removeItem(itemId, productId);
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    // Proceed to checkout - also needs to be a Server Action
    const onCheckoutAction = () => {
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
                <p className="text-gray-500">Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
                <EmptyCart />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="lg:w-2/3">
                    <CartTable
                        cart={cart}
                        updating={updating}
                        updateMessages={updateMessages}
                        onUpdateQuantityAction={onUpdateQuantityAction}
                        onRemoveAction={onRemoveAction}
                    />
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <CartSummary
                        cart={cart}
                        onCheckoutAction={onCheckoutAction}
                    />
                </div>
            </div>
        </div>
    );
}