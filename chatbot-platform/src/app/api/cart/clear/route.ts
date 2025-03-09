import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCartId } from '@/lib/cart-utils';

export async function POST() {
    const client = await pool.connect();

    try {
        // Use the shared utility function to get the cart ID
        const cartId = await getCartId();

        if (!cartId) {
            console.warn("No active cart found");
            return NextResponse.json({ success: true, message: 'No cart to clear' });
        }

        console.log("Clearing cart ID:", cartId);

        // Start transaction
        await client.query('BEGIN');

        // Delete all items in the cart
        const deleteResult = await client.query(
            `DELETE FROM cart_items WHERE cart_id = $1`,
            [cartId]
        );

        console.log("Deleted items count:", deleteResult.rowCount);

        // Optional: Delete the cart itself
        // await client.query(`DELETE FROM carts WHERE id = $1`, [cartId]);

        // Commit transaction
        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);

        // Rollback transaction in case of an error
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error("Error during rollback:", rollbackError);
        }

        return NextResponse.json(
            { error: "Failed to clear cart", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}