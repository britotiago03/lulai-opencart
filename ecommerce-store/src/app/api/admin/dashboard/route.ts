// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/auth-config";
import pool from "@/lib/db";

// Route handler for fetching admin dashboard statistics
export async function GET() {
    try {
        // Verify admin session using admin auth options
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // Start a transaction to ensure consistent counts
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Get product count
            const productCountResult = await client.query(
                "SELECT COUNT(*) FROM products"
            );
            const totalProducts = parseInt(productCountResult.rows[0].count, 10);

            // Get order count
            const orderCountResult = await client.query(
                "SELECT COUNT(*) FROM orders"
            );
            const totalOrders = parseInt(orderCountResult.rows[0].count, 10);

            // Get user count
            const userCountResult = await client.query(
                "SELECT COUNT(*) FROM users"
            );
            const totalUsers = parseInt(userCountResult.rows[0].count, 10);

            // Get recent orders (limit to 10)
            const recentOrdersResult = await client.query(
                `SELECT o.id, o.status, o.total_amount, o.created_at, 
                COALESCE(u.name, 'Guest') as customer_name, 
                COALESCE(u.email, sa.email) as customer_email
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
         ORDER BY o.created_at DESC
         LIMIT 10`
            );

            await client.query("COMMIT");

            // Return dashboard data
            return NextResponse.json({
                totalProducts,
                totalOrders,
                totalUsers,
                recentOrders: recentOrdersResult.rows.map(order => ({
                    ...order,
                    total_amount: Number(order.total_amount), // ✅ Fix: Ensure it's a number
                })),
            });
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Database error in dashboard:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}