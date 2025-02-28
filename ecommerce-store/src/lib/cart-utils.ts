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
        // 🟢 Logged-in User: First find user ID from email, then find cart
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [session.user.email]);

        if (!userRes.rowCount || userRes.rowCount === 0) {
            console.warn(`No user found for email: ${session.user.email}`);
            return null;
        }

        const userId = userRes.rows[0].id;

        // Now find the cart using this user ID
        const cartRes = await pool.query("SELECT id FROM carts WHERE user_id = $1", [userId]);

        if (cartRes?.rowCount && cartRes.rowCount > 0) {
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
        // 🔴 Anonymous User: Find cart by session ID stored in cookies
        const cookieStore = cookies();
        // Important: Use await when accessing cookies
        const sessionIdCookie = await cookieStore.get("session-id");
        let sessionId = sessionIdCookie?.value;

        // Create a new session ID if one doesn't exist
        if (!sessionId && createIfNotExists) {
            sessionId = crypto.randomUUID();
            // Important: Use await when setting cookies
            await cookieStore.set("session-id", sessionId, {
                httpOnly: true,
                maxAge: 86400 * 30
            });
        }

        if (sessionId) {
            const cartRes = await pool.query("SELECT id FROM carts WHERE session_id = $1", [sessionId]);

            if (cartRes?.rowCount && cartRes.rowCount > 0) {
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