/**
 * Defines the payment data types for the Stripe payment method
 */
export interface StripePaymentData {
    paymentMethod: 'stripe';
    last4?: string;
    cardholderName: string;
    paymentIntentId?: string;
    paymentMethodId?: string;
}

// We're using PaymentData in our checkout API endpoint
export type PaymentData = StripePaymentData;

// Create a type for the order data that's sent to the checkout endpoint
export interface OrderData {
    customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentData: PaymentData; // Using PaymentData here
    cartItems: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
}