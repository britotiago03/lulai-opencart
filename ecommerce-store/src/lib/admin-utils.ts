// lib/admin-utils.ts
import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth-config";

/**
 * Validates if the user is authenticated and has admin permissions
 * @param requireSuperAdmin Whether super admin privileges are required
 * @returns Session object if authenticated, null otherwise
 */
export async function validateAdminAccess(requireSuperAdmin = false): Promise<{
    session: Session | null;
    errorResponse: NextResponse | null;
}> {
    const session = await getServerSession(adminAuthOptions);

    if (!session?.user?.isAdmin) {
        return {
            session: null,
            errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        };
    }

    if (requireSuperAdmin && !session.user.isSuperAdmin) {
        return {
            session: null,
            errorResponse: NextResponse.json({ error: "Unauthorized - Super admin privileges required" }, { status: 401 })
        };
    }

    return {
        session,
        errorResponse: null
    };
}

/**
 * Validates a user ID parameter
 */
export function validateUserId(id: string | undefined): {
    isValid: boolean;
    errorResponse: NextResponse | null;
} {
    if (!id || isNaN(Number(id))) {
        return {
            isValid: false,
            errorResponse: NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
        };
    }

    return {
        isValid: true,
        errorResponse: null
    };
}