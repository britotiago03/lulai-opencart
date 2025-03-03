import bcrypt from "bcryptjs";
import pool from './db';

interface User {
    id: string;
    email: string;
    name: string;
    apiKey?: string; // Optional for regular users
    isAdmin?: boolean; // Optional for regular users
}

export async function verifyUser(email: string, password: string, apiKey?: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
        return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return null;
    }

    // If apiKey is provided, verify it for admin login
    if (apiKey) {
        if (!user.is_admin || user.api_key !== apiKey) {
            return null;
        }
    }

    return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        apiKey: user.api_key,
        isAdmin: user.is_admin
    };
}