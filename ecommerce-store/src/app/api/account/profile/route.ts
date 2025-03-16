import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
    try {
        // Get the user's session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Query the user profile from the database
        const userId = session.user.id;
        const userResult = await pool.query(
            "SELECT id, name, email, subscription_status FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return just the basic user data
        const profile = {
            id: userResult.rows[0].id,
            name: userResult.rows[0].name,
            email: userResult.rows[0].email,
            subscriptionStatus: userResult.rows[0].subscription_status || 'free'
        };

        // Return the profile data
        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Error getting profile:", error);
        return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Get the user's session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse the request body
        const { name } = await req.json();
        const userId = session.user.id;

        // Update the user's name
        await pool.query(
            "UPDATE users SET name = $1 WHERE id = $2",
            [name, userId]
        );

        return NextResponse.json({
            message: "Profile updated successfully",
            user: { id: userId, name }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}