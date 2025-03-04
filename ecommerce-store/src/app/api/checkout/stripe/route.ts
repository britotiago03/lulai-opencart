import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction, calculateOrderTotals, insertShippingAddress, insertOrderItems } from '@/lib/db';
import { CustomerInfo } from '@/types/order';
import { StripePaymentData } from '@/types/payment';
import { CartItem } from '@/lib/db';

interface CheckoutData {
    customerInfo: CustomerInfo;
    paymentMethod: string;
    paymentData: StripePaymentData;
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
            // In a real app, you would process the payment with Stripe here
            // For this demo, we'll assume payment was successful

            // 1. Create or get cart (assuming guest checkout with session_id for now)
            // In a real app, you'd check for user_id if logged in
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
                    'processing',
                    'stripe',
                    'paid',
                    JSON.stringify({
                        cardLast4: data.paymentData.last4,
                        cardholderName: data.paymentData.cardholderName
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

            // 5. Return success response
            return NextResponse.json({
                success: true,
                orderId,
                // In a real app with Stripe, you might include a redirectUrl here
                // redirectUrl: stripeCheckoutSession.url
            });
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}