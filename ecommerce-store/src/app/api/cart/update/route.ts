import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCartId, checkCartItem } from "@/lib/cart-utils";

export async function PUT(req: Request) {
    try {
        const { productId, quantity } = await req.json();
        if (!productId || quantity < 0) {
            return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
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

        if (quantity === 0) {
            // 🔥 Remove item if quantity is set to 0
            await pool.query("DELETE FROM cart_items WHERE id = $1", [cartItem.cartItemId]);
        } else {
            // 🔄 Update the quantity
            await pool.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [quantity, cartItem.cartItemId]);
        }

        return NextResponse.json({ success: true, message: "Cart updated successfully!" });
    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}