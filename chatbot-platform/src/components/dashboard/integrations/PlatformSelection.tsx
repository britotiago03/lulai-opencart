// src/components/dashboard/integrations/PlatformSelection.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, ShoppingCart, Code } from "lucide-react";
import React from "react";

interface PlatformSelectionProps {
    onPlatformSelect: (platform: string) => void;
}

export default function PlatformSelection({ onPlatformSelect }: PlatformSelectionProps) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Step 1: Select a Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PlatformCard
                    title="OpenCart"
                    icon={<Globe className="mx-auto h-12 w-12 text-blue-500" />}
                    onClick={() => onPlatformSelect("opencart")}
                />

                <PlatformCard
                    title="Shopify"
                    icon={<ShoppingCart className="mx-auto h-12 w-12 text-blue-500" />}
                    onClick={() => onPlatformSelect("shopify")}
                />

                <PlatformCard
                    title="Custom Store"
                    icon={<Code className="mx-auto h-12 w-12 text-blue-500" />}
                    onClick={() => onPlatformSelect("customstore")}
                />
            </div>
        </div>
    );
}

interface PlatformCardProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
}

function PlatformCard({ title, icon, onClick }: PlatformCardProps) {
    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow bg-[#1b2539] border-0">
            <div onClick={onClick} className="cursor-pointer">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    {icon}
                </CardContent>
            </div>
        </Card>
    );
}