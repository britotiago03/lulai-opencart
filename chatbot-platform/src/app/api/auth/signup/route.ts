// "/api/auth/signup" route
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createVerificationToken, TOKEN_TYPES } from "@/lib/tokenService";
import { sendVerificationEmail } from "@/lib/emailService";
import { getServerSession } from "next-auth";
import { userAuthOptions } from "@/lib/auth-config";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 for generating unique IDs

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        const session = await getServerSession(userAuthOptions);

        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

       // Start a transaction
       const client = await pool.connect();
       try {
           await client.query('BEGIN');

           const newUserID = uuidv4(); // Generate a new UUID for the user ID

           // Insert new user with verified=false
           const result = await client.query(
               "INSERT INTO users (id, name, email, password, verified, auth_provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
               [newUserID, name, email, hashedPassword, false, 'email']
           );
           console.log("New user inserted");

           const userId = result.rows[0].id;
           console.log("user id: ", userId);

           // Create verification token
           const token = await createVerificationToken(userId, TOKEN_TYPES.EMAIL_VERIFICATION, undefined, client);
           console.log("verification token passed");

           // Send verification email
           await sendVerificationEmail(email, token, name);
           console.log("verification email passed");

           await client.query('COMMIT');

           return NextResponse.json(
               { message: "User created successfully. Please check your email to verify your account." },
               { status: 201 }
           );
       } catch (error) {
           await client.query('ROLLBACK');
           console.error("Transaction error:", error);
           return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
       } finally {
           client.release();
       }

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
