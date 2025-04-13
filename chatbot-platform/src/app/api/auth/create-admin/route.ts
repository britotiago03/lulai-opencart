// src/app/api/auth/create-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        // Simple security token check - you can change this token
        const { name, email, password, token } = await req.json();

        // Very basic security check - you should use a more secure token in production
        if (token !== "create-admin-123456") {
            return NextResponse.json(
                { message: "Invalid security token" },
                { status: 401 }
            );
        }

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Check if the user already exists
            const existingUser = await client.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                // Update the existing user
                const result = await client.query(
                    "UPDATE users SET name = $1, password = $2, role = $3 WHERE email = $4 RETURNING *",
                    [name, hashedPassword, "admin", email]
                );

                return NextResponse.json({
                    message: "Admin user updated successfully",
                    user: {
                        id: result.rows[0].id,
                        name: result.rows[0].name,
                        email: result.rows[0].email,
                        role: result.rows[0].role
                    }
                });
            } else {
                // Create a new admin user
                const result = await client.query(
                    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
                    [name, email, hashedPassword, "admin"]
                );

                return NextResponse.json({
                    message: "Admin user created successfully",
                    user: {
                        id: result.rows[0].id,
                        name: result.rows[0].name,
                        email: result.rows[0].email,
                        role: result.rows[0].role
                    }
                });
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error creating admin user:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}