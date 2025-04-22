import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import Link from "next/link";

export default function EmptyState({ search }: { search: string }) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                    {search ? "No agents found matching your search" : "No agents yet"}
                </h3>
                <p className="text-gray-400 mb-6">
                    {search ? "Try searching with different keywords" : "Create your first chatbot agent to get started"}
                </p>
                {!search && (
                    <Link
                        href={`/dashboard/integrations`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create Your First Agent
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
