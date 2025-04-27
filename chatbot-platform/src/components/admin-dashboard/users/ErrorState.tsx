// src/components/admin-dashboard/users/ErrorState.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
    message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6 text-center">
                <p className="text-red-400 mb-4">{message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </CardContent>
        </Card>
    );
}
