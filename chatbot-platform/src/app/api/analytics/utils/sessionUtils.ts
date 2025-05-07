// src/app/api/analytics/utils/sessionUtils.ts
import { getServerSession } from "next-auth/next";
import { PoolClient } from "pg";
import { userAuthOptions, adminAuthOptions } from "@/lib/auth-config";

export interface SessionData {
    user: {
        id: string;
        role: string;
    };
    isAdminCrossAccess?: boolean;
}

export async function getAuthenticatedSession(): Promise<SessionData | null> {
    // First try user session
    let session = await getServerSession(userAuthOptions);
    
    // If no user session found, try admin session
    if (!session) {
        const adminSession = await getServerSession(adminAuthOptions);
        
        // If admin session found, create a proxy session with user role data
        if (adminSession && adminSession.user?.role === "admin") {
            session = {
                ...adminSession,
                // Add a flag to indicate this is an admin accessing user endpoints
                isAdminCrossAccess: true
            };
        }
    }
    
    return session;
}

export async function validateChatbotOwnership(
    client: PoolClient,
    chatbotId: string,
    userId: string
): Promise<boolean> {
    const ownerCheck = await client.query(
        "SELECT id FROM chatbots WHERE id = $1 AND user_id = $2",
        [chatbotId, userId]
    );

    return ownerCheck.rows.length > 0;
}

export async function getChatbotInfo(
    client: PoolClient,
    chatbotId: string
): Promise<{ apiKey: string; name: string } | null> {
    const result = await client.query(
        "SELECT api_key, name FROM chatbots WHERE id = $1",
        [chatbotId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return {
        apiKey: result.rows[0].api_key,
        name: result.rows[0].name
    };
}