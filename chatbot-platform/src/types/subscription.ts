// src/types/subscription.ts

// Basic subscription data
export interface Subscription {
    plan_type: 'free' | 'basic' | 'pro';
    price: number;
    status?: string;
}

// Full subscription data as retrieved from the database
export interface RetrievedSubscription {
    id: string;
    user_id: string;
    plan_type: 'free' | 'basic' | 'pro';
    price: number;
    status: string;
    payment_method: string;
    payment_id: string;
    created_at: string;
    start_date: string;
    end_date: string;
}

// Extended subscription data for the admin dashboard
export interface AdminSubscription {
    id: number | string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    plan_type: 'free' | 'basic' | 'pro';
    price: number;
    status: 'active' | 'cancelled' | 'expired';
    payment_method?: string;
    payment_id?: string;
    created_at: string;
    start_date: string;
    end_date?: string;
    last_updated: string;
}

// Utility functions for formatting
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
};