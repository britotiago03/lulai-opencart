// src/components/admin-dashboard/analytics/ErrorCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorCardProps {
    error: string | null;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-6 text-center">
                    <p className="text-red-400 mb-4">{error || "Failed to load analytics data."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};