import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
    user: "postgres",
    host: "postgres", // ✅ Use "postgres" inside Docker
    database: "ecommerce_db",
    password: "postgres",
    port: 5432,
});

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Find user by email
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const user = userResult.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Return success response (NextAuth will handle session creation)
        return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
