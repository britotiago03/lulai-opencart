import { Subscription } from "./subscription";

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
export interface SubscriptionData {
    paymentMethod: string;
    paymentData: PaymentData; // Using PaymentData here
    subscription: Subscription | null;
}