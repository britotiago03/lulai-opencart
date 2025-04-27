// src/components/dashboard/ErrorDisplay.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
    error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6">
                    <div className="text-center py-4">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link
                            href={`/dashboard/integrations`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create New Chatbot
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}