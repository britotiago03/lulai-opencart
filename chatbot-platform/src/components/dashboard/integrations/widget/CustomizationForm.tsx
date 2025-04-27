// src/components/dashboard/integrations/widget/CustomizationForm.tsx
import React from "react";
import { ColorField, NumberField, TextField, SelectField } from "./FormFields";
import { WidgetConfig } from "@/types/integrations";

interface CustomizationFormProps {
    widgetConfig: WidgetConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function CustomizationForm({ widgetConfig, onChange }: CustomizationFormProps) {
    const fontOptions = [
        { value: "Helvetica Neue, Helvetica, Arial, sans-serif", label: "Helvetica" },
        { value: "'Roboto', sans-serif", label: "Roboto" },
        { value: "'Open Sans', sans-serif", label: "Open Sans" },
        { value: "'Lato', sans-serif", label: "Lato" },
        { value: "'Arial', sans-serif", label: "Arial" }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorField
                label="Primary Color"
                name="primaryColor"
                value={widgetConfig.primaryColor}
                onChange={onChange}
                helpText="Used for header and buttons"
            />

            <ColorField
                label="Secondary Color"
                name="secondaryColor"
                value={widgetConfig.secondaryColor}
                onChange={onChange}
                helpText="Used for chat bubbles"
            />

            <NumberField
                label="Button Size (px)"
                name="buttonSize"
                min="40"
                max="100"
                value={widgetConfig.buttonSize}
                onChange={onChange}
            />

            <NumberField
                label="Window Width (px)"
                name="windowWidth"
                min="300"
                max="500"
                value={widgetConfig.windowWidth}
                onChange={onChange}
            />

            <NumberField
                label="Window Height (px)"
                name="windowHeight"
                min="400"
                max="700"
                value={widgetConfig.windowHeight}
                onChange={onChange}
            />

            <TextField
                label="Header Text"
                name="headerText"
                value={widgetConfig.headerText}
                onChange={onChange}
            />

            <SelectField
                label="Font Family"
                name="fontFamily"
                value={widgetConfig.fontFamily}
                options={fontOptions}
                onChange={onChange}
            />
        </div>
    );
}