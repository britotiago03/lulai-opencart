import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { userAuthOptions } from "@/lib/auth-config";

// This route checks if the user has an active subscription
// and redirects them accordingly
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(userAuthOptions);

        if (!session || !session.user) {
            // If no session, redirect to login
            return NextResponse.redirect(new URL('/auth/signin', req.url));
        }

        // Check if the user has an active subscription
        const userId = session.user.id;

        // You can replace this with your actual database query
        // For now we'll check if subscription exists
        const hasSubscription = await checkSubscription(userId);

        if (!hasSubscription) {
            // Redirect to subscription page if no active subscription
            return NextResponse.redirect(new URL('/subscriptions', req.url));
        }

        // If they have a subscription, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch (error) {
        console.error('Error in check-subscription route:', error);
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
}

// Function to check if a user has an active subscription
// Replace this with your actual database query
async function checkSubscription(userId: string): Promise<boolean> {
    try {
        // Example query - replace with your actual database check
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // If error or no subscription, return false
            return false;
        }

        const data = await response.json();

        // Check if there's an active subscription
        return data.hasActiveSubscription === true;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}