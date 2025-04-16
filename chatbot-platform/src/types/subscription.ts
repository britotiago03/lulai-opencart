// src/types/subscription.ts
export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    plan_type: string;
    price: number;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
}

export interface RetrievedSubscription {
    id: string;
    plan_type: string;
    price: number;
    start_date: string;
    renewal_date: string;
    status: string;
}