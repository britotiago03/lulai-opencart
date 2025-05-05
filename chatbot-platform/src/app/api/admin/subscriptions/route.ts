import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminAuthOptions } from "@/lib/auth-config";
import { pool } from '@/lib/db';

export async function GET() {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session || !session.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: 'Admin authentication required' },
                { status: 401 }
            );
        }

        // Fetch all subscriptions with user information
        const result = await pool.query(`
            SELECT 
                s.*,
                u.email as user_email,
                u.name as user_name
            FROM 
                subscriptions s
            JOIN 
                users u ON s.user_id = u.id
            ORDER BY 
                s.created_at DESC
        `);

        // Format the data to match what the admin expects
        const subscriptions = result.rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            user_name: row.user_name || 'Unknown User',
            user_email: row.user_email || 'no-email@example.com',
            plan_type: row.plan_type,
            price: parseFloat(row.price) || 0,
            status: row.status,
            payment_method: row.payment_method,
            payment_id: row.payment_id,
            created_at: row.created_at,
            start_date: row.start_date,
            end_date: row.end_date,
            last_updated: row.updated_at || row.created_at
        }));

        return NextResponse.json({ subscriptions });

    } catch (error) {
        console.error('Error fetching all subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}