import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';
import { Order, OrderItem, CustomerInfo } from '@/types/order';

export async function GET(
    _: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        // Await the params object before accessing properties
        const { orderId } = await context.params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        return await executeTransaction(async (client) => {
            const orderResult = await client.query(
                `SELECT o.id, o.status, o.payment_method, o.payment_status, 
                    o.payment_details, o.shipping_amount, o.tax_amount, 
                    o.subtotal_amount, o.total_amount, o.created_at,
                    s.first_name, s.last_name, s.email, s.phone, 
                    s.address, s.city, s.state, s.zip_code, s.country
                FROM orders o
                JOIN shipping_addresses s ON o.id = s.order_id
                WHERE o.id = $1`,
                [orderId]
            );

            if (orderResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const orderData = orderResult.rows[0];

            // Fetch the order items
            const itemsResult = await client.query(
                `SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.price, oi.total, 
                    p.images -> 0 as image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = $1`,
                [orderId]
            );

            const customerInfo: CustomerInfo = {
                firstName: orderData.first_name,
                lastName: orderData.last_name,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.address,
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zip_code,
                country: orderData.country
            };

            const items: OrderItem[] = itemsResult.rows.map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: item.quantity,
                total: parseFloat(item.total),
                imageUrl: item.image_url?.replace(/"/g, '') || '/images/placeholder.jpg'
            }));

            const order: Order = {
                id: orderData.id,
                status: orderData.status,
                dateCreated: orderData.created_at,
                customerInfo,
                items,
                paymentMethod: orderData.payment_method,
                paymentDetails: orderData.payment_details,
                paymentStatus: orderData.payment_status,
                subtotal: parseFloat(orderData.subtotal_amount),
                shipping: parseFloat(orderData.shipping_amount),
                tax: parseFloat(orderData.tax_amount),
                total: parseFloat(orderData.total_amount)
            };

            return NextResponse.json({ order });
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
}
