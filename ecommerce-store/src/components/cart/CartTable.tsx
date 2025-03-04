"use client";

import { CartItem } from "./CartItem";
import { Cart as CartType } from "@/types/cart";

interface CartTableProps {
    cart: CartType;
    updating: Record<number, boolean>;
    updateMessages: Record<number, { type: 'success' | 'error', message: string }>;
    onUpdateQuantityAction: (itemId: number, productId: number, newQuantity: number) => void;
    onRemoveAction: (itemId: number, productId: number) => void;
}

export function CartTable({
                              cart,
                              updating,
                              updateMessages,
                              onUpdateQuantityAction,
                              onRemoveAction
                          }: CartTableProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-center">Price</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                    <CartItem
                        key={item.cart_item_id}
                        item={item}
                        updating={updating[item.cart_item_id]}
                        updateMessage={updateMessages[item.cart_item_id]}
                        onUpdateQuantityAction={onUpdateQuantityAction}
                        onRemoveAction={onRemoveAction}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
}