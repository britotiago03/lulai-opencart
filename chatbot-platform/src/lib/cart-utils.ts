import { getServerSession } from "next-auth/next";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

interface CartInfo {
    cartId: number | null;
    cartItemId?: number;
    exists: boolean;
}

/**
 * Gets the user's cart ID based on their session
 * Works for both logged-in and anonymous users
 * @param createIfNotExists If true, creates a new cart if one doesn't exist
 */
export async function getCartId(createIfNotExists = false): Promise<number | null> {
    const session = await getServerSession();
    let cartId: number | null = null;

    if (session?.user?.email) {
        // Logged-in User: Find user ID from email, then find cart
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [session.user.email]);

        if (!userRes.rowCount) return null;
        const userId = userRes.rows[0].id;

        // Now find the cart using this user ID
        const cartRes = await pool.query("SELECT id FROM carts WHERE user_id = $1", [userId]);
        if (cartRes?.rowCount) {
            cartId = cartRes.rows[0].id;
        } else if (createIfNotExists) {
            // Create a new cart for the logged-in user
            const newCartRes = await pool.query(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                [userId]
            );
            cartId = newCartRes.rows[0].id;
        }
    } else {
        // Anonymous User: Find cart by session ID stored in cookies
        // Force TypeScript to treat cookies() as returning a Promise
        const cookieStore = await (cookies() as unknown as Promise<ReturnType<typeof cookies>>);
        const sessionIdCookie = cookieStore.get("session-id");
        let sessionId = sessionIdCookie?.value;

        // If no session ID exists, create one
        if (!sessionId && createIfNotExists) {
            sessionId = crypto.randomUUID();
            // Using a different approach to await a void function
            cookieStore.set("session-id", sessionId, {
                httpOnly: true,
                maxAge: 86400 * 30
            });
            // Use a separate await Promise.resolve() to satisfy runtime requirements
            await Promise.resolve();
        }

        if (sessionId) {
            const cartRes = await pool.query("SELECT id FROM carts WHERE session_id = $1", [sessionId]);
            if (cartRes?.rowCount) {
                cartId = cartRes.rows[0].id;
            } else if (createIfNotExists) {
                // Create a new cart for the anonymous user
                const newCartRes = await pool.query(
                    "INSERT INTO carts (session_id) VALUES ($1) RETURNING id",
                    [sessionId]
                );
                cartId = newCartRes.rows[0].id;
            }
        }
    }

    return cartId;
}

/**
 * Checks if a product exists in the user's cart
 */
export async function checkCartItem(cartId: number, productId: string | number): Promise<CartInfo> {
    // Check if product exists in the cart
    const itemRes = await pool.query(
        "SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2",
        [cartId, productId]
    );

    return {
        cartId,
        cartItemId: itemRes?.rowCount && itemRes.rowCount > 0 ? itemRes.rows[0].id : undefined,
        exists: !!(itemRes?.rowCount && itemRes.rowCount > 0)
    };
}