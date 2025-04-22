// src/components/admin-dashboard/users/EmptyUserState.tsx
import React from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyUserState() {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                    No users found
                </h3>
                <p className="text-gray-400">
                    Try adjusting your search or filter criteria
                </p>
            </CardContent>
        </Card>
    );
}