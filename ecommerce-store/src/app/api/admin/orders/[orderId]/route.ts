import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/auth-config";
import { sendEventToAll } from '@/app/api/events/route';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        // Get the current session to verify admin access
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Await the params object before accessing properties
        const { orderId } = await context.params;

        // Parse the update data from the request
        const updateData = await request.json();

        // Validate required fields
        if (!updateData.status) {
            return NextResponse.json(
                { error: 'Order status is required' },
                { status: 400 }
            );
        }

        return await executeTransaction(async (client) => {
            // Update the order status
            const result = await client.query(
                `UPDATE orders
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id, status, payment_status, total_amount, created_at`,
                [updateData.status, orderId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const updatedOrder = result.rows[0];

            // Get customer info for the event notification
            const customerResult = await client.query(
                `SELECT s.first_name, s.last_name, s.email
                FROM shipping_addresses s
                WHERE s.order_id = $1`,
                [orderId]
            );

            let customerName = "Customer";
            let customerEmail = "";

            if (customerResult.rows.length > 0) {
                customerName = `${customerResult.rows[0].first_name} ${customerResult.rows[0].last_name}`;
                customerEmail = customerResult.rows[0].email;
            }

            // Create the event payload
            const orderUpdateEvent = {
                id: updatedOrder.id,
                status: updatedOrder.status,
                previousStatus: updateData.previousStatus || null,
                customer: {
                    name: customerName,
                    email: customerEmail
                },
                total: parseFloat(updatedOrder.total_amount),
                updatedAt: new Date().toISOString()
            };

            // Log connection info before sending event
            console.log(`[Orders] Preparing to send order-updated event for Order #${orderId}`);

            // Send event to all connected clients with a short delay
            setTimeout(() => {
                try {
                    sendEventToAll('order-updated', orderUpdateEvent);
                    console.log(`[Orders] Successfully sent order-updated event for Order #${orderId}`);
                } catch (eventError) {
                    console.error(`[Orders] Error sending order-updated event for Order #${orderId}:`, eventError);
                }
            }, 200);

            return NextResponse.json({
                success: true,
                order: updatedOrder
            });
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}