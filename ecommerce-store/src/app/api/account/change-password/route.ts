import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        // Get the user's session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse the request body
        const { currentPassword, newPassword } = await req.json();
        const userId = session.user.id;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
        }

        // Get the user's current hashed password from database
        const userResult = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const storedHashedPassword = userResult.rows[0].password;

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedHashedPassword);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        // Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [newHashedPassword, userId]
        );

        return NextResponse.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
    }
}