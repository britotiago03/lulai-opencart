"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
    item: CartItemType;
    updating: boolean;
    updateMessage?: { type: 'success' | 'error', message: string };
    onUpdateQuantityAction: (itemId: number, productId: number, newQuantity: number) => void;
    onRemoveAction: (itemId: number, productId: number) => void;
}

export function CartItem({
                             item,
                             updating,
                             updateMessage,
                             onUpdateQuantityAction,
                             onRemoveAction
                         }: CartItemProps) {
    return (
        <tr>
            <td className="py-4 px-4">
                <div className="flex items-center">
                    <div className="relative h-16 w-16 mr-4">
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            layout="fill"
                            objectFit="contain"
                            className="rounded border bg-white"
                        />
                    </div>
                    <Link href={`/product/${item.product_id}`} className="hover:text-blue-600">
                        {item.name}
                    </Link>
                </div>
            </td>
            <td className="py-4 px-4 text-center">${item.price.toFixed(2)}</td>
            <td className="py-4 px-4">
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => onUpdateQuantityAction(item.cart_item_id, item.product_id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="px-2 py-1 bg-gray-200 rounded-l disabled:opacity-50"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1) {
                                onUpdateQuantityAction(item.cart_item_id, item.product_id, value);
                            }
                        }}
                        className="w-12 text-center py-1 border-y outline-none"
                        disabled={updating}
                    />
                    <button
                        onClick={() => onUpdateQuantityAction(item.cart_item_id, item.product_id, item.quantity + 1)}
                        disabled={updating}
                        className="px-2 py-1 bg-gray-200 rounded-r disabled:opacity-50"
                    >
                        +
                    </button>
                </div>
                {/* Message after update */}
                {updateMessage && (
                    <div className={`text-xs mt-1 text-center ${
                        updateMessage.type === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}>
                        {updateMessage.message}
                    </div>
                )}
            </td>
            <td className="py-4 px-4 text-right">${item.item_total.toFixed(2)}</td>
            <td className="py-4 px-4 text-center">
                <button
                    onClick={() => onRemoveAction(item.cart_item_id, item.product_id)}
                    disabled={updating}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                    Remove
                </button>
            </td>
        </tr>
    );
}