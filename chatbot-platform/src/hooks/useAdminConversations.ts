"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/conversation";

export function useAdminConversations() {
    const { status } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/admin/conversations");

                if (!response.ok) {
                    console.error("Failed to fetch admin conversations");
                    setError("Failed to load conversations. Please try again.");
                    return;
                }

                const data: Conversation[] = await response.json();

                // Group conversations by thread (user_id + api_key combination)
                const grouped: Record<string, Conversation[]> = data.reduce((acc, convo) => {
                    const key = `${convo.user_id}-${convo.api_key}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(convo);
                    return acc;
                }, {} as Record<string, Conversation[]>);

                // Get the latest message from each thread and add thread metadata
                const latestMessages: Conversation[] = Object.values(grouped).map((group) => {
                    const sorted = [...group].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    const latestMsg = sorted[0];
                    return {
                        ...latestMsg,
                        threadId: `${latestMsg.user_id}-${latestMsg.api_key}`,
                        messageCount: group.length,
                        firstMessage: sorted[sorted.length - 1]
                    };
                });

                // Sort threads by the latest message's timestamp (descending)
                latestMessages.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setConversations(latestMessages);
            } catch (error) {
                console.error("Error loading admin conversations:", error);
                setError("Failed to load conversations");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            void fetchConversations();
        }
    }, [status]);

    return { conversations, loading, error };
}