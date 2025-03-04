import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Get session ID from request cookies
        const sessionId = request.cookies.get('session_id')?.value;

        if (!sessionId) {
            return NextResponse.json(
                { success: true, message: 'No cart to clear' }
            );
        }

        // Process using our transaction helper
        return await executeTransaction(async (client) => {
            // Find the cart ID
            const cartResult = await client.query(
                `SELECT id FROM carts WHERE session_id = $1`,
                [sessionId]
            );

            if (cartResult.rows.length > 0) {
                const cartId = cartResult.rows[0].id;

                // Delete all items in the cart
                await client.query(
                    `DELETE FROM cart_items WHERE cart_id = $1`,
                    [cartId]
                );

                // Optionally, you could also delete the cart itself
                // await client.query(
                //   `DELETE FROM carts WHERE id = $1`,
                //   [cartId]
                // );
            }

            return NextResponse.json({ success: true });
        });
    } catch (error) {
        console.error('Error clearing cart:', error);

        // Safe error handling
        const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        return NextResponse.json(
            { error: 'Failed to clear cart', details: errorMessage },
            { status: 500 }
        );
    }
}