export interface Subscription {
    plan_type: string;
    price: number;
}

export interface RetrievedSubscription {
    id: number;
    user_id: number;
    plan_type: string;
    price: number;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
}