// src/components/dashboard/integrations/widget/types.ts
import { WidgetConfig } from "@/types/integrations";
import React from "react";

export interface WidgetCustomizationProps {
    widgetConfig: WidgetConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export interface ColorFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    helpText?: string;
}

export interface NumberFieldProps {
    label: string;
    name: string;
    min: string;
    max: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TextFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    options: Array<{value: string, label: string}>;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface WidgetPreviewProps {
    widgetConfig: WidgetConfig;
}