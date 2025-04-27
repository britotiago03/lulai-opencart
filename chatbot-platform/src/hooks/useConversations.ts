import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface Conversation {
    id: string;
    user_id: string;
    api_key: string;
    message_role: string;
    message_content: string;
    created_at: string;
    chatbot_name?: string;
    threadId?: string;
    messageCount?: number;
    firstMessage?: Conversation;
}

export function useConversations() {
    const { status } = useSession(); // session not needed
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/conversations");

                if (!response.ok) {
                    console.error("Failed to fetch conversations");
                    setError("Failed to load conversations. Please try again.");
                    setLoading(false); // <—— Add this!
                    return;
                }

                const data: Conversation[] = await response.json();

                const grouped: Record<string, Conversation[]> = data.reduce((acc, convo) => {
                    const key = `${convo.user_id}-${convo.api_key}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(convo);
                    return acc;
                }, {} as Record<string, Conversation[]>);

                const latest: Conversation[] = Object.values(grouped).map((group) => {
                    const sorted = [...group].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    const latestMsg = sorted[0];
                    return {
                        ...latestMsg,
                        threadId: `${latestMsg.user_id}-${latestMsg.api_key}`,
                        messageCount: group.length,
                        firstMessage: sorted[sorted.length - 1],
                    };
                });

                setConversations(latest);
                setLoading(false); // <—— Also here
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Error loading conversations:", error.message);
                    setError(error.message);
                } else {
                    console.error("Unexpected error:", error);
                    setError("Something went wrong.");
                }
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            void fetchConversations(); // Ensure promise isn't ignored
        }
    }, [status, router]);

    return { conversations, loading, error };
}
