// "/api/subscriptions/edit-status" route
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { executeTransaction } from "@/lib/db";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const session = await getServerSession(userAuthOptions);

        // Validate session
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        console.log("Retrieved request body: ", body);

        // Validate request body
        if (!body.subscription_type) {
            return NextResponse.json(
                { error: "Missing subscription_type in request body." },
                { status: 400 }
            );
        }

        await executeTransaction(async (client) => {
            console.log("Editing...");
            await client.query(
                `UPDATE users SET subscription_status = $1 WHERE id = $2`,
                [body.subscription_type, session?.user.id]
            )
        });

        // Verify the updated subscription status
        await executeTransaction(async (client) => {
            const result = await client.query(
                `SELECT subscription_status FROM users WHERE id = $1`,
                [session?.user.id]
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: "User not found." },
                    { status: 404 }
                );
            }

            console.log("New subscription status: ", result.rows[0].subscription_status);
        });

        console.log("Edit finished");
        
        // Return success response
        return NextResponse.json(
            { message: "Subscription status updated successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating subscription status');
        return NextResponse.json(
            { error: "Error updating user subscription status" },
            { status: 500 }
        );
    }
}