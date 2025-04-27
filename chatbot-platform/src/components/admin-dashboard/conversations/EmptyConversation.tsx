// src/components/admin-dashboard/conversations/EmptyConversation.tsx
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyConversation() {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <p className="text-gray-400 mb-4">No messages found for this conversation.</p>
            </CardContent>
        </Card>
    );
}