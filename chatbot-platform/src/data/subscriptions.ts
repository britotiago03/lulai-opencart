// src/data/subscriptions.ts
import { AdminSubscription } from '@/types/subscription';

// Sample subscription data for development
export const sampleSubscriptions: AdminSubscription[] = [
    {
        id: 1,
        user_id: "u_123456",
        user_name: "John Smith",
        user_email: "john@example.com",
        plan_type: "pro",
        price: 29.99,
        status: "active",
        payment_method: "stripe",
        payment_id: "pi_1N7HjrLkd7H3Z4X",
        created_at: "2024-02-15T10:24:32Z",
        start_date: "2024-02-15T10:24:32Z",
        end_date: "2025-02-15T10:24:32Z",
        last_updated: "2024-02-15T10:24:32Z"
    },
    {
        id: 2,
        user_id: "u_789012",
        user_name: "Jane Doe",
        user_email: "jane@example.com",
        plan_type: "basic",
        price: 9.99,
        status: "active",
        payment_method: "paypal",
        payment_id: "PAY-4X7Y8Z9A0B",
        created_at: "2024-03-01T14:15:22Z",
        start_date: "2024-03-01T14:15:22Z",
        end_date: "2025-03-01T14:15:22Z",
        last_updated: "2024-03-01T14:15:22Z"
    },
    {
        id: 3,
        user_id: "u_345678",
        user_name: "Robert Johnson",
        user_email: "robert@example.com",
        plan_type: "pro",
        price: 29.99,
        status: "cancelled",
        payment_method: "stripe",
        payment_id: "pi_2O8IksLkd7H3Z4X",
        created_at: "2024-01-10T09:12:45Z",
        start_date: "2024-01-10T09:12:45Z",
        end_date: "2024-04-10T09:12:45Z",
        last_updated: "2024-03-15T16:30:12Z"
    },
    {
        id: 4,
        user_id: "u_901234",
        user_name: "Sarah Williams",
        user_email: "sarah@example.com",
        plan_type: "free",
        price: 0.00,
        status: "active",
        created_at: "2024-03-20T11:42:18Z",
        start_date: "2024-03-20T11:42:18Z",
        last_updated: "2024-03-20T11:42:18Z"
    },
    {
        id: 5,
        user_id: "u_567890",
        user_name: "Michael Brown",
        user_email: "michael@example.com",
        plan_type: "basic",
        price: 9.99,
        status: "expired",
        payment_method: "stripe",
        payment_id: "pi_3P9JltLkd7H3Z4X",
        created_at: "2023-09-05T08:30:00Z",
        start_date: "2023-09-05T08:30:00Z",
        end_date: "2024-03-05T08:30:00Z",
        last_updated: "2024-03-06T00:00:00Z"
    }
];

// Function to fetch subscriptions (would connect to an API in production)
export async function fetchSubscriptions(): Promise<AdminSubscription[]> {
    // In a real implementation, you would fetch from your API
    // const response = await fetch('/api/admin/subscriptions');
    // return await response.json();

    // For development, return the sample data
    return Promise.resolve(sampleSubscriptions);
}