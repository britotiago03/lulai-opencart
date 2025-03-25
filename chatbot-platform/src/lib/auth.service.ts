import bcrypt from "bcryptjs";
import pool from './db';

interface User {
    id: string;
    email: string;
    name: string;   
    subsciption_status?: string;
    subscription_renewal_date?: Date | null;
    verified?: boolean;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            console.log("User not found");
            return null; 
        }

        const user = result.rows[0];


        if (!user.verified) {
            console.log("User not verified");
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log("Invalid password");
            return null;
        }

        return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            subsciption_status: user.subsciption_status,
            subscription_renewal_date: user.subscription_renewal_date,
            verified: user.verified,
        };

    } catch (error) {
        console.error("Error verifying user");
        throw error;
    }
    
}