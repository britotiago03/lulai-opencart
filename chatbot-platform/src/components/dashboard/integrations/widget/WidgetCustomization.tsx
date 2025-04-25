// src/components/dashboard/integrations/widget/WidgetCustomization.tsx
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { WidgetCustomizationProps } from "./types";
import CustomizationForm from "./CustomizationForm";
import WidgetPreview from "./WidgetPreview";

export default function WidgetCustomization({
                                                widgetConfig,
                                                onChange
                                            }: WidgetCustomizationProps) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Customize Widget</h2>
            <p className="text-gray-400 mb-4">
                Personalize your chatbot widget appearance and behavior.
            </p>
            <Card className="shadow-lg mb-6 bg-[#1b2539] border-0">
                <CardContent className="pt-6">
                    <CustomizationForm widgetConfig={widgetConfig} onChange={onChange} />
                    <WidgetPreview widgetConfig={widgetConfig} />
                </CardContent>
            </Card>
        </div>
    );
}