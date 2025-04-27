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