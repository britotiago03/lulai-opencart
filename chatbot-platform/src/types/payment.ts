// src/types/payment.ts

// Customer data for payment processing
export interface CustomerData {
    name: string;
    email: string;
}

// Stripe payment data interface
export interface StripePaymentData {
    paymentMethodId: string;
    amount: number;
    currency: string;
    description: string;
    customer: CustomerData;
    paymentIntentId: string;
}

// Subscription data for checkout
export interface SubscriptionData {
    paymentMethod: string;
    paymentData: StripePaymentData;
    subscription: {
        plan_type: 'free' | 'basic' | 'pro';
        price: number;
    } | null;
}