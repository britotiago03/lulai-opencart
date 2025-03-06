import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserOrders } from "@/lib/auth.service";

// In Next.js API route handlers, we need to export specific HTTP method handlers
// Here we only handle GET requests and don't use the request parameter
export async function GET() {
    try {
        // Get the current session
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to view your orders" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get the user's orders
        const orders = await getUserOrders(userId);

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}