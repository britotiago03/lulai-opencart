// "/api/subscriptions/edit-status/route.ts"
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { executeTransaction } from "@/lib/db";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const session = await getServerSession(userAuthOptions);

        console.log("Proceed to edit status...");

        // Validate session
        if (!session?.user?.id) {
            console.log("Unauthorized access attempt detected.");
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // Validate request body
        if (!body.subscription_type) {
            console.log("Missing subscription_type in request body.");
            return NextResponse.json(
                { error: "Missing subscription_type in request body." },
                { status: 400 }
            );
        }

        // First transaction: Update subscription status
        await executeTransaction(async (client) => {
            console.log("Updating subscription status...");
            await client.query(
                `UPDATE users SET subscription_status = $1 WHERE id = $2`,
                [body.subscription_type, session.user.id.toString()] 
            );
        });

        // Second transaction: Verify update
        const verificationResult = await executeTransaction(async (client) => {
            console.log("Verifying subscription status update...");
            const result = await client.query(
                `SELECT subscription_status FROM users WHERE id = $1`,
                [session.user.id.toString()]
            );
            return result;
        });

        if (verificationResult.rows.length === 0) {
            console.log("User not found after update.");
            return NextResponse.json(
                { error: "User not found after update." },
                { status: 404 }
            );
        }

        console.log("Subscription status updated successfully, new status:", verificationResult.rows[0].subscription_status);
        return NextResponse.json(
            { 
                message: "Subscription status updated successfully.",
                newStatus: verificationResult.rows[0].subscription_status 
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Error updating subscription status:', error);
        return NextResponse.json(
            { 
                error: "Error updating user subscription status",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}