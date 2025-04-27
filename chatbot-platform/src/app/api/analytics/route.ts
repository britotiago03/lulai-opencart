// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession, validateChatbotOwnership, getChatbotInfo } from "./utils/sessionUtils";
import { getDbClient } from "./utils/dbUtils";
import { getSingleChatbotAnalytics } from "./services/chatbotService";
import { getAdminAnalytics } from "./services/adminService";
import { getClientAnalytics } from "./services/clientService";

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthenticatedSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const chatbotId = searchParams.get('chatbotId');
        const timeRange = searchParams.get('timeRange') || '30'; // Default to 30 days
        const daysToInclude = parseInt(timeRange);

        const client = await getDbClient();

        try {
            // Case 1: Analytics for a specific chatbot
            if (chatbotId) {
                // Verify ownership if not admin
                if (session.user.role !== 'admin') {
                    const isOwner = await validateChatbotOwnership(client, chatbotId, session.user.id);

                    if (!isOwner) {
                        return NextResponse.json(
                            { message: "Chatbot not found or unauthorized" },
                            { status: 404 }
                        );
                    }
                }

                // Get the API key for this chatbot
                const chatbotInfo = await getChatbotInfo(client, chatbotId);

                if (!chatbotInfo) {
                    return NextResponse.json(
                        { message: "Chatbot not found" },
                        { status: 404 }
                    );
                }

                const result = await getSingleChatbotAnalytics(
                    client,
                    chatbotInfo.apiKey,
                    chatbotId,
                    chatbotInfo.name,
                    daysToInclude
                );

                return NextResponse.json(result);
            }

            // Case 2: Admin requesting global analytics
            else if (session.user.role === 'admin') {
                const adminAnalytics = await getAdminAnalytics(client, daysToInclude);
                return NextResponse.json(adminAnalytics);
            }

            // Case 3: Client requesting their own aggregate analytics
            else {
                const clientAnalytics = await getClientAnalytics(client, session.user.id, daysToInclude);
                return NextResponse.json(clientAnalytics);
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}