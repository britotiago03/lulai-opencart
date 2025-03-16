import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Lightweight endpoint to only fetch the current status of an order
 * Used for quick status checks without loading all order details
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Get the current session
        const session = await getServerSession(authOptions);

        return await executeTransaction(async (client) => {
            let query = `
                SELECT o.id, o.user_id, o.status, o.payment_status, o.created_at, o.updated_at
                FROM orders o
                WHERE o.id = $1
            `;

            const queryParams = [orderId];

            // For authenticated users, add user_id check to ensure they own the order
            if (session?.user?.id) {
                query += ' AND o.user_id = $2';
                queryParams.push(session.user.id);
            }

            const result = await client.query(query, queryParams);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const orderData = result.rows[0];

            // If not authenticated, check if the order requires authentication
            if (!session?.user?.id && orderData.user_id) {
                return NextResponse.json(
                    { error: 'Authentication required to view this order status' },
                    { status: 403 }
                );
            }

            // Return only the status information
            return NextResponse.json({
                id: orderData.id,
                status: orderData.status,
                paymentStatus: orderData.payment_status,
                created: orderData.created_at,
                lastUpdated: orderData.updated_at
            });
        });
    } catch (error) {
        console.error('Error fetching order status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order status' },
            { status: 500 }
        );
    }
}