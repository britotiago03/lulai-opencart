import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCartId, checkCartItem } from "@/lib/cart-utils";

export async function DELETE(req: Request) {
    try {
        // Get the product ID from the URL
        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Get the cart ID using the shared utility function
        const cartId = await getCartId();

        if (!cartId) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        // Check if the product exists in the cart
        const cartItem = await checkCartItem(cartId, productId);

        if (!cartItem.exists) {
            return NextResponse.json({ error: "Product not found in cart" }, { status: 404 });
        }

        // 🗑️ Remove the item from the cart
        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
            [cartId, productId]
        );

        return NextResponse.json({
            success: true,
            message: "Product successfully removed from cart"
        });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}