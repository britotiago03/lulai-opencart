// src/app/api/analytics/utils/sessionUtils.ts
import { getServerSession } from "next-auth/next";
import { PoolClient } from "pg";
import { userAuthOptions } from "@/lib/auth-config";

export interface SessionData {
    user: {
        id: string;
        role: string;
    };
}

export async function getAuthenticatedSession(): Promise<SessionData | null> {
    return await getServerSession(userAuthOptions);
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