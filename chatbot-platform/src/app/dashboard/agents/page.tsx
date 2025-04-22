"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import AgentGrid from "@/components/dashboard/agents/AgentGrid";
import ErrorState from "@/components/dashboard/agents/ErrorState";
import EmptyState from "@/components/dashboard/agents/EmptyState";
import AgentSearchBar from "@/components/dashboard/agents/AgentSearchBar";

export interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    platform: string;
    api_key: string;
    product_api_url: string;
    created_at: string;
    updated_at: string;
}

export default function AgentsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetch("/api/chatbots")
                .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch chatbots"))
                .then(setChatbots)
                .catch(() => setError("Failed to load chatbots. Please try again."))
                .finally(() => setLoading(false));
        }
    }, [status, router]);

    const filtered = chatbots.filter((bot) =>
        [bot.name, bot.description, bot.industry].some((field) =>
            field?.toLowerCase().includes(search.toLowerCase())
        )
    );

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Your Agents</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <AgentSearchBar value={search} onChange={setSearch} />
                    <Link
                        href={`/dashboard/integrations`}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Agent
                    </Link>
                </div>
            </div>

            {error ? (
                <ErrorState message={error} />
            ) : filtered.length === 0 ? (
                <EmptyState search={search} />
            ) : (
                <AgentGrid chatbots={filtered} />
            )}
        </div>
    );
}
