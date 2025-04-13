// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            // Check if email already exists
            const existingUser = await client.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                return NextResponse.json(
                    { message: "Email already in use" },
                    { status: 409 }
                );
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const result = await client.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
                [name, email, hashedPassword, "client"]
            );

            const newUser = result.rows[0];

            return NextResponse.json(
                {
                    message: "User registered successfully",
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    }
                },
                { status: 201 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}