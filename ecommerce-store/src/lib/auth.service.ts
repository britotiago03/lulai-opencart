import bcrypt from "bcryptjs";
import pool from './db';

interface User {
    id: string;
    email: string;
    name: string;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return null;
    }

    return {
        id: user.id.toString(),
        email: user.email,
        name: user.name
    };
}