// src/components/admin-dashboard/chatbots/EmptyState.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function EmptyState() {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                    No chatbots found
                </h3>
                <p className="text-gray-400">
                    Try adjusting your search or filter criteria
                </p>
            </CardContent>
        </Card>
    );
}