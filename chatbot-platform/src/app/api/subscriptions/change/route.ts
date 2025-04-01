// "/api/subscriptions/change" route
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { executeTransaction } from "@/lib/db";

export async function PUT(req: Request) {
    // Implement subscription change route
    try {
        const body = await req.json();
        const session = await getServerSession(userAuthOptions);

        // Validate session
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // Validate request body
        if (!body.subscription_type) {
            return NextResponse.json(
                { error: "Missing subscription_type in request body." },
                { status: 400 }
            );
        }

        // Proceed with the subscription change logic here
        // For example, update the subscription type in the database
        // First transaction: Update subscription status
        await executeTransaction(async (client) => {
            console.log("Updating subscription status...");
            await client.query(
                `UPDATE subscriptions SET (plan_type, price, current_period_start, current_period_renewal) = ($1, $2, $3, $4) WHERE user_id = $5`,
                [
                    body.subscription_type, 
                    body.price, 
                    new Date().toISOString(),
                    new Date(new Date().setMonth(new Date().getMonth() +1)).toISOString(), 
                    session.user.id.toString()
                ]
            );
        })

        // Verify the subscription change
        const verificationResult = await executeTransaction(async (client) => {
            console.log("Verifying subscription status update...");
            const result = await client.query(
                `SELECT plan_type, id FROM subscriptions WHERE user_id = $1`,
                [session.user.id.toString()]
            );
            return result;
        });

        if(verificationResult.rows.length === 0) {
            console.log("User not found after update.");
            return NextResponse.json(
                { error: "User not found after update." },
                { status: 404 }
            );
        }

        // Update user subscription status in the users table
        // First transaction: Update subscription status
        await executeTransaction(async (client) => {
            console.log("Updating subscription status...");
            await client.query(
                `UPDATE users SET (subscription_status, subscription_renewal_date) = ($1, $2) WHERE id = $3`,
                [
                    body.subscription_type, 
                    new Date(new Date().setMonth(new Date().getMonth() +1)).toISOString(), 
                    session.user.id.toString()
                ]
            );
        });

        // Second transaction: Verify update
        const verifiedUserUpdate = await executeTransaction(async (client) => {
            console.log("Verifying subscription status update...");
            const result = await client.query(
                `SELECT subscription_status FROM users WHERE id = $1`,
                [session.user.id.toString()] // Ensure ID is string
            );
            return result;
        });

        if (verifiedUserUpdate.rows.length === 0) {
            console.log("User not found after update.");
            return NextResponse.json(
                { error: "User not found after update." },
                { status: 404 }
            );
        }

        console.log("Subscription status updated successfully, new status:", verificationResult.rows[0].plan_type);
        return NextResponse.json({
            success: true,
            subscriptionId: verificationResult.rows[0].id,
        });
    } catch (error) {
        console.error("Error changing subscription:", error);
        return NextResponse.json(
            { error: "An error occurred while changing the subscription." },
            { status: 500 }
        );
    }
}