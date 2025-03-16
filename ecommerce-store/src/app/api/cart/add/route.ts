import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCartId, checkCartItem } from "@/lib/cart-utils";

export async function POST(req: Request) {
    try {
        const { productId, quantity } = await req.json();
        if (!productId || quantity <= 0) {
            return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
        }

        // Get or create a cart ID using the enhanced utility function
        const cartId = await getCartId(true); // true means create if not exists

        // ✅ Ensure cartId is valid before continuing
        if (!cartId) {
            console.error("Failed to create or fetch cart");
            return NextResponse.json({ error: "Failed to create or fetch cart" }, { status: 500 });
        }

        // Log for debugging
        console.log(`Adding product ${productId} to cart ${cartId} with quantity ${quantity}`);

        // ✅ Check if product is already in the cart
        const cartItem = await checkCartItem(cartId, productId);

        if (cartItem.exists && cartItem.cartItemId) {
            // 🔄 Update quantity if product exists in the cart
            console.log(`Updating existing cart item ${cartItem.cartItemId}`);
            await pool.query(
                "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
                [quantity, cartItem.cartItemId]
            );
        } else {
            // ➕ Insert new product into the cart
            console.log(`Adding new cart item for product ${productId} to cart ${cartId}`);
            await pool.query(
                "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
                [cartId, productId, quantity]
            );
        }

        // Get updated cart count for response
        const cartCountRes = await pool.query(
            "SELECT SUM(quantity) as total FROM cart_items WHERE cart_id = $1",
            [cartId]
        );

        const totalItems = cartCountRes.rows[0]?.total || 0;

        return NextResponse.json({
            success: true,
            message: "Product added to cart!",
            totalItems
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal Server Error"
        }, { status: 500 });
    }
}