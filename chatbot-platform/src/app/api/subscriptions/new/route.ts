// "/api/subscriptions/new" route
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";

export async function POST(req: Request) {
    const data = await req.json();
    const session = await getServerSession(userAuthOptions);

    console.log("parsed body:", data);

    try {
        // Validate session
        if (!session?.user?.id) {
            console.log("User not found in session.");
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // Validate request body
        if (!data.plan_type) {
            console.log("Missing required subscription information");

            if(!data.plan_type) {
                console.log("Missing plan_type in request body.");
            }
            return NextResponse.json(
                { error: "Missing required subscription information" },
                { status: 400 }
            );
        }

        const subscriptionResult = await pool.query(
            `INSERT INTO subscriptions 
            (user_id, user_email, plan_type, price, created_at, status, current_period_start, current_period_renewal)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [
                session?.user.id,
                session?.user.email,
                data.plan_type,
                data.plan_price,
                new Date().toISOString(),
                "active",
                new Date().toISOString(),
                new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            ]
        );

        const subscriptionId = subscriptionResult.rows[0].id;
        console.log(`Created subscription ${subscriptionId} for user ${session?.user.id}`);

        return NextResponse.json({
            success: true,
        });
    } catch(error) {
        console.error("Error in /api/subscriptions/new:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription details" },
            { status: 500 }
        );
    }
}