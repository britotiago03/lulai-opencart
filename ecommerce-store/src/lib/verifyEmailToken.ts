// lib/verifyEmailToken.ts
import pool from "@/lib/db";
import { verifyToken, deleteToken } from "@/lib/tokenService";

export async function handleEmailVerification(token: string, updateField: string) {
    // Log verification attempt
    console.log(`Verifying token for field: ${updateField}`);

    const verification = await verifyToken(token);

    if (!verification.valid || !verification.userId) {
        console.error(`Invalid or expired token: ${token.substring(0, 10)}...`);
        return { error: "Invalid or expired token", status: 400 };
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Check if user exists and isn't already verified
        const userResult = await client.query(
            `SELECT id, ${updateField} FROM users WHERE id = $1`,
            [verification.userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return { error: "User not found", status: 404 };
        }

        const user = userResult.rows[0];

        // If already verified, we can still return success
        if (user[updateField] === true) {
            await client.query("COMMIT");
            return {
                success: true,
                message: "Account already verified. You can now log in."
            };
        }

        // Update user's verification status
        await client.query(
            `UPDATE users SET ${updateField} = true WHERE id = $1`,
            [verification.userId]
        );

        // Delete the token after use
        await deleteToken(token);

        await client.query("COMMIT");

        console.log(`Successfully verified user ${verification.userId} for ${updateField}`);

        return {
            success: true,
            message: "Your account has been verified successfully. You can now log in."
        };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Verification transaction error:", error);
        return { error: "Failed to update verification status", status: 500 };
    } finally {
        client.release();
    }
}