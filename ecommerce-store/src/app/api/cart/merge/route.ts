import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
    const client = await pool.connect();

    try {
        const session = await getServerSession();
        console.log("Current session:", session);

        // Only proceed if user is logged in
        if (!session?.user?.email) {
            return NextResponse.json({ error: "User must be logged in to merge carts" }, { status: 401 });
        }

        const userEmail = session.user.email;
        console.log("User email from session:", userEmail);

        // Look up the user ID from the database using the email
        const userLookupRes = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [userEmail]
        );

        if (!userLookupRes.rowCount || userLookupRes.rowCount === 0) {
            console.error("User not found in database:", userEmail);
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        const userId = userLookupRes.rows[0].id;
        console.log("Found user ID:", userId);

        // Get session ID from cookies
        const cookieStore = cookies();
        const sessionIdCookie = await cookieStore.get("session-id");
        const sessionId = sessionIdCookie?.value;

        console.log("Anonymous session ID from cookie:", sessionId);

        // If there's no session ID, there's no anonymous cart to merge
        if (!sessionId) {
            return NextResponse.json({
                success: true,
                message: "No anonymous cart to merge"
            });
        }

        // Start a database transaction
        await client.query('BEGIN');

        // 1. Find the anonymous cart
        const anonCartRes = await client.query(
            "SELECT id FROM carts WHERE session_id = $1",
            [sessionId]
        );

        console.log("Anonymous cart lookup result:", anonCartRes.rows);

        if (!anonCartRes.rowCount || anonCartRes.rowCount === 0) {
            await client.query('COMMIT');
            return NextResponse.json({
                success: true,
                message: "No anonymous cart to merge"
            });
        }

        const anonCartId = anonCartRes.rows[0].id;
        console.log("Anonymous cart ID:", anonCartId);

        // 2. Find or create the user cart
        const userCartRes = await client.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        let userCartId;

        if (userCartRes.rowCount && userCartRes.rowCount > 0) {
            userCartId = userCartRes.rows[0].id;
            console.log("Found existing user cart ID:", userCartId);
        } else {
            // Create a new cart for the user
            const newCartRes = await client.query(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                [userId]
            );
            userCartId = newCartRes.rows[0].id;
            console.log("Created new user cart ID:", userCartId);
        }

        // 3. Get all items from the anonymous cart
        const anonItemsRes = await client.query(
            "SELECT product_id, quantity FROM cart_items WHERE cart_id = $1",
            [anonCartId]
        );

        console.log("Anonymous cart items:", anonItemsRes.rows);

        // 4. For each anonymous cart item
        for (const item of anonItemsRes.rows) {
            // Check if product is already in user's cart
            const existingItemRes = await client.query(
                "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
                [userCartId, item.product_id]
            );

            if (existingItemRes.rowCount && existingItemRes.rowCount > 0) {
                // Update quantity if product exists
                await client.query(
                    "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
                    [item.quantity, existingItemRes.rows[0].id]
                );
                console.log(`Updated quantity for product ${item.product_id} in user cart`);
            } else {
                // Add product to user's cart if it doesn't exist
                await client.query(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
                    [userCartId, item.product_id, item.quantity]
                );
                console.log(`Added product ${item.product_id} to user cart`);
            }
        }

        // 5. Delete the anonymous cart and its items (cascade delete will remove items)
        await client.query("DELETE FROM carts WHERE id = $1", [anonCartId]);
        console.log(`Deleted anonymous cart ${anonCartId}`);

        // 6. Clear the session ID cookie
        await cookieStore.set("session-id", "", { maxAge: 0 });
        console.log("Cleared session-id cookie");

        await client.query('COMMIT');
        console.log("Transaction committed successfully");

        return NextResponse.json({
            success: true,
            message: "Carts merged successfully"
        });
    } catch (error) {
        // If we were in a transaction, roll it back
        try {
            await client.query('ROLLBACK');
            console.log("Transaction rolled back due to error");
        } catch (rollbackError) {
            console.error("Error during rollback:", rollbackError);
        }

        console.error("Error merging carts:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
}