export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
    imageUrl?: string;
}

// Payment details interfaces for different payment methods
export interface StripePaymentDetails {
    cardLast4: string;
    cardholderName: string;
}

export interface PayPalPaymentDetails {
    email: string;
}

export interface ManualPaymentDetails {
    manualMethod: string;
    notes?: string;
}

// Union type for payment details
export type PaymentDetails = StripePaymentDetails | PayPalPaymentDetails | ManualPaymentDetails | Record<string, unknown>;

export interface Order {
    id: string | number;
    status: OrderStatus;
    dateCreated: string;
    customerInfo: CustomerInfo;
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    paymentDetails?: PaymentDetails;
    paymentStatus: PaymentStatus;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    notes?: string;
}

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'refunded';

export type PaymentMethod =
    | 'stripe'
    | 'paypal'
    | 'manual'
    | 'bank_transfer'
    | 'check'
    | 'money_order'
    | 'cash_on_delivery';

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'refunded';