import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction, calculateOrderTotals, insertShippingAddress, insertOrderItems } from '@/lib/db';
import { CustomerInfo } from '@/types/order';
import { PayPalPaymentData } from '@/types/payment';
import { CartItem } from '@/lib/db';

interface CheckoutData {
    customerInfo: CustomerInfo;
    paymentMethod: string;
    paymentData: PayPalPaymentData;
    cartItems: CartItem[];
}

export async function POST(request: NextRequest) {
    try {
        const data: CheckoutData = await request.json();

        // Validate required data
        if (!data.customerInfo || !data.paymentData || !data.cartItems || data.cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Missing required checkout information' },
                { status: 400 }
            );
        }

        // Calculate order totals
        const { subtotal, shippingAmount, taxAmount, totalAmount } = calculateOrderTotals(data.cartItems);

        // Process the order using our transaction helper
        return await executeTransaction(async (client) => {
            // In a real app, you would initialize a PayPal transaction here
            // For this demo, we'll create a pending order

            // 1. Create or get cart (assuming guest checkout with session_id for now)
            const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);

            // 2. Insert order record
            const orderResult = await client.query(
                `INSERT INTO orders 
                (session_id, status, payment_method, payment_status, payment_details, 
                shipping_amount, tax_amount, subtotal_amount, total_amount)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id`,
                [
                    sessionId,
                    'pending',
                    'paypal',
                    'pending',
                    JSON.stringify({
                        email: data.paymentData.email
                    }),
                    shippingAmount,
                    taxAmount,
                    subtotal,
                    totalAmount
                ]
            );

            const orderId = orderResult.rows[0].id;

            // 3. Insert shipping address
            await insertShippingAddress(client, orderId, data.customerInfo);

            // 4. Insert order items
            await insertOrderItems(client, orderId, data.cartItems);

            // 5. Return success response with PayPal approval URL
            // In a real app, this would be from PayPal's API
            const approvalUrl = `/order-confirmation/${orderId}?paypal=approved`;

            return NextResponse.json({
                success: true,
                orderId,
                approvalUrl
            });
        });
    } catch (error) {
        console.error('PayPal checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to process PayPal payment' },
            { status: 500 }
        );
    }
}