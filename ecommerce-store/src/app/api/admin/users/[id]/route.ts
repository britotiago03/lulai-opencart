// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validateAdminAccess, validateUserId } from "@/lib/admin-utils";

// GET /api/admin/users/[id] - Get a specific admin user
export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Validate admin access
        const { errorResponse } = await validateAdminAccess();
        if (errorResponse) return errorResponse;

        // Validate user ID
        const { isValid, errorResponse: idError } = validateUserId(params.id);
        if (!isValid) return idError;

        const { id } = params;

        // Fetch user data
        const result = await pool.query(
            `SELECT id, name, email, is_super_admin, is_active, created_at, last_login
       FROM admin_users
       WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
        }

        return NextResponse.json({ user: result.rows[0] });
    } catch (error) {
        console.error("Error fetching admin user:", error);
        return NextResponse.json(
            { error: "Error fetching admin user", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/users/[id] - Update an admin user
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Validate super admin access
        const { session, errorResponse } = await validateAdminAccess(true);
        if (errorResponse) return errorResponse;

        // Make sure session is not null before using it
        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Validate user ID
        const { isValid, errorResponse: idError } = validateUserId(params.id);
        if (!isValid) return idError;

        const { id } = params;

        // Get current user data to check if it's the last super admin
        const currentUserResult = await pool.query(
            "SELECT is_super_admin FROM admin_users WHERE id = $1",
            [id]
        );

        if (currentUserResult.rows.length === 0) {
            return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
        }

        // Parse request data
        const updateData = await req.json();

        // If trying to demote a super admin, check if they're the last one
        if (
            currentUserResult.rows[0].is_super_admin === true &&
            updateData.is_super_admin === false
        ) {
            const superAdminCountResult = await pool.query(
                "SELECT COUNT(*) FROM admin_users WHERE is_super_admin = true"
            );

            const superAdminCount = parseInt(superAdminCountResult.rows[0].count);

            if (superAdminCount <= 1) {
                return NextResponse.json(
                    { error: "Cannot demote the last super admin" },
                    { status: 400 }
                );
            }
        }

        // Build dynamic update query
        const updateFields = [];
        const queryParams = [];
        let paramIndex = 1;

        if (updateData.name !== undefined) {
            updateFields.push(`name = $${paramIndex++}`);
            queryParams.push(updateData.name);
        }

        if (updateData.is_super_admin !== undefined) {
            updateFields.push(`is_super_admin = $${paramIndex++}`);
            queryParams.push(updateData.is_super_admin);
        }

        if (updateData.is_active !== undefined) {
            updateFields.push(`is_active = $${paramIndex++}`);
            queryParams.push(updateData.is_active);
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        // Add ID as the last parameter
        queryParams.push(id);

        // Execute update
        await pool.query(
            `UPDATE admin_users
       SET ${updateFields.join(", ")}
       WHERE id = $${paramIndex}`,
            queryParams
        );

        // Fetch updated user data
        const result = await pool.query(
            `SELECT id, name, email, is_super_admin, is_active, created_at, last_login
       FROM admin_users
       WHERE id = $1`,
            [id]
        );

        return NextResponse.json({
            success: true,
            user: result.rows[0],
            message: "Admin user updated successfully"
        });
    } catch (error) {
        console.error("Error updating admin user:", error);
        return NextResponse.json(
            { error: "Error updating admin user", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete an admin user
export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Validate super admin access
        const { session, errorResponse } = await validateAdminAccess(true);
        if (errorResponse) return errorResponse;

        // Make sure session is not null before using it
        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Validate user ID
        const { isValid, errorResponse: idError } = validateUserId(params.id);
        if (!isValid) return idError;

        const { id } = params;

        // Self-protection - can't delete yourself
        if (id === session.user.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Check if user is a super admin
        const userResult = await pool.query(
            "SELECT is_super_admin FROM admin_users WHERE id = $1",
            [id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
        }

        // If trying to delete a super admin, check if they're the last one
        if (userResult.rows[0].is_super_admin) {
            const superAdminCountResult = await pool.query(
                "SELECT COUNT(*) FROM admin_users WHERE is_super_admin = true"
            );

            const superAdminCount = parseInt(superAdminCountResult.rows[0].count);

            if (superAdminCount <= 1) {
                return NextResponse.json(
                    { error: "Cannot delete the last super admin" },
                    { status: 400 }
                );
            }
        }

        // Delete the user
        await pool.query("DELETE FROM admin_users WHERE id = $1", [id]);

        return NextResponse.json({
            success: true,
            message: "Admin user deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting admin user:", error);
        return NextResponse.json(
            { error: "Error deleting admin user", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}