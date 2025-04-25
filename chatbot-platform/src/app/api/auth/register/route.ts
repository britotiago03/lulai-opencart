// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique ID for the email signup user
        const userId = `email_${uuidv4()}`;

        // Create new user with generated ID
        await pool.query(
            'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
            [userId, name, email, hashedPassword, 'client']
        );

        return NextResponse.json(
            { message: 'User registered successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}