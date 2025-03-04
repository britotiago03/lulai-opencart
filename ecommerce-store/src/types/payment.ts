// Define the payment data types for different payment methods

export interface StripePaymentData {
    paymentMethod: 'stripe';
    last4: string;
    cardholderName: string;
}

export interface PayPalPaymentData {
    paymentMethod: 'paypal';
    email: string;
}

export interface ManualPaymentData {
    paymentMethod: 'manual';
    manualMethod: string;
    notes?: string;
}

// Union type for all payment data
export type PaymentData = StripePaymentData | PayPalPaymentData | ManualPaymentData;