// lib/admin-auth.ts
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { CredentialsConfig } from "next-auth/providers/credentials";
import { User } from "next-auth";

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(email: string, password: string) {
    try {
        // Get admin user by email
        const result = await pool.query(
            "SELECT * FROM admin_users WHERE email = $1 AND is_active = true",
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const admin = result.rows[0];

        // If password is not set, admin needs to complete setup
        if (!admin.password) {
            return { error: "ADMIN_SETUP_INCOMPLETE" };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return null;
        }

        // Update last login time
        await pool.query(
            "UPDATE admin_users SET last_login = NOW() WHERE id = $1",
            [admin.id]
        );

        // Return user data without password - using object rest/spread to omit the password
        const adminData = { ...admin };
        delete adminData.password;

        return {
            ...adminData,
            isAdmin: true
        };
    } catch (error) {
        console.error("Admin authentication error:", error);
        throw error;
    }
}

/**
 * Custom CredentialsProvider for admin authentication
 */
export const AdminCredentialsProvider: CredentialsConfig = {
    id: "admin-credentials",
    name: "Admin Credentials",
    type: "credentials",
    credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials: Record<string, string> | undefined) {
        try {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            const adminResult = await verifyAdminCredentials(
                credentials.email,
                credentials.password
            );

            if (!adminResult) {
                return null;
            }

            // Check if we got an error back
            if ('error' in adminResult) {
                console.error(`Admin authorization error: ${adminResult.error}`);
                return null;
            }

            // Return admin with isAdmin flag for session as a valid User object
            return {
                id: adminResult.id.toString(),
                email: adminResult.email,
                name: adminResult.name,
                subscription: null,
                subscription_status: null,
                subscription_end_date: null,
                isAdmin: true,
                isSuperAdmin: adminResult.is_super_admin
            } as User;
        } catch (error) {
            console.error("Admin authorization error:", error);
            return null;
        }
    }
};