import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction, calculateOrderTotals, insertShippingAddress, insertOrderItems } from '@/lib/db';
import { CustomerInfo } from '@/types/order';
import { ManualPaymentData } from '@/types/payment';
import { CartItem } from '@/lib/db';

interface CheckoutData {
    customerInfo: CustomerInfo;
    paymentMethod: string;
    paymentData: ManualPaymentData;
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
            // 1. Create or get cart (assuming guest checkout with session_id for now)
            const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);

            // 2. Insert order record with the specific manual payment method
            const manualMethod = data.paymentData.manualMethod || 'bank_transfer';

            const orderResult = await client.query(
                `INSERT INTO orders 
                (session_id, status, payment_method, payment_status, payment_details, 
                shipping_amount, tax_amount, subtotal_amount, total_amount, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id`,
                [
                    sessionId,
                    'pending', // Manual payments start as pending
                    manualMethod,
                    'pending',
                    JSON.stringify({
                        manualMethod: data.paymentData.manualMethod,
                        notes: data.paymentData.notes
                    }),
                    shippingAmount,
                    taxAmount,
                    subtotal,
                    totalAmount,
                    data.paymentData.notes || null
                ]
            );

            const orderId = orderResult.rows[0].id;

            // 3. Insert shipping address
            await insertShippingAddress(client, orderId, data.customerInfo);

            // 4. Insert order items
            await insertOrderItems(client, orderId, data.cartItems);

            // 5. Return success response
            return NextResponse.json({
                success: true,
                orderId
            });
        });
    } catch (error) {
        console.error('Manual payment checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to process order' },
            { status: 500 }
        );
    }
}