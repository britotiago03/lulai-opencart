import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCartId } from "@/lib/cart-utils";

export async function GET() {
    try {
        // Get the user's cart ID
        const cartId = await getCartId();

        if (!cartId) {
            // Return an empty cart rather than an error for new visitors
            return NextResponse.json({
                cart: {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            });
        }

        // Fetch cart items with product details using JOIN
        // Note: We now extract the first image from the images JSON array
        const cartItemsRes = await pool.query(`
            SELECT 
                ci.id as cart_item_id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.price,
                p.images->0 as image_url,
                (p.price * ci.quantity) as item_total
            FROM 
                cart_items ci
            JOIN 
                products p ON ci.product_id = p.id
            WHERE 
                ci.cart_id = $1
            ORDER BY
                ci.id
        `, [cartId]);

        const cartItems = cartItemsRes.rows;

        // Calculate cart totals
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.item_total), 0);

        return NextResponse.json({
            cart: {
                id: cartId,
                items: cartItems,
                totalItems,
                totalPrice: parseFloat(totalPrice.toFixed(2))
            }
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}