// lib/auth.service.ts
import bcrypt from "bcryptjs";
import pool from './db';

export interface User {
    id: string;
    email: string;
    name: string;
    subscription_status?: string;
    subscription_end_date?: Date | null;
    verified?: boolean;
}

/**
 * Verify user credentials and return user if valid
 */
export async function verifyUser(email: string, password: string): Promise<User | null> {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];

        // Check if user is verified
        if (!user.verified) {
            return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return null;
        }

        // Return user without password
        return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            subscription_status: user.subscription_status,
            subscription_end_date: user.subscription_end_date,
            verified: user.verified
        };
    } catch (error) {
        console.error("Error verifying user:", error);
        throw error;
    }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string) {
    try {
        const result = await pool.query(
            `SELECT 
                o.id, 
                o.created_at as date, 
                o.status, 
                o.total_amount as total,
                COUNT(oi.id) as items
            FROM 
                orders o
            LEFT JOIN 
                order_items oi ON o.id = oi.order_id
            WHERE 
                o.user_id = $1
            GROUP BY 
                o.id, o.created_at, o.status, o.total_amount
            ORDER BY 
                o.created_at DESC`,
            [userId]
        );

        return result.rows.map(row => ({
            id: row.id,
            date: row.date,
            status: row.status,
            total: parseFloat(row.total),
            items: parseInt(row.items)
        }));
    } catch (error) {
        console.error("Error getting user orders:", error);
        return [];
    }
}

/**
 * Check if user's password is correct
 */
export async function checkUserPassword(userId: string, password: string): Promise<boolean> {
    try {
        // Get user from database
        const result = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return false;
        }

        // Check if password matches
        return await bcrypt.compare(password, result.rows[0].password);
    } catch (error) {
        console.error('Error checking user password:', error);
        return false;
    }
}

/**
 * Check if an email is already taken
 */
export async function isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    try {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
        const params: (string | number)[] = [email];

        // If excludeUserId is provided, exclude that user from the check
        if (excludeUserId) {
            query += ' AND id != $2';
            params.push(excludeUserId);
        }

        const result = await pool.query(query, params);
        return result.rows[0].count > 0;
    } catch (error) {
        console.error('Error checking if email is taken:', error);
        throw error;
    }
}