// src/components/dashboard/integrations/WidgetCustomization.tsx
import { Card, CardContent } from "@/components/ui/card";
import { WidgetConfig } from "@/types/integrations";
import React from "react";

interface WidgetCustomizationProps {
    widgetConfig: WidgetConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

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

                        <div>
                            <label className="block text-sm font-medium">Font Family</label>
                            <select
                                name="fontFamily"
                                value={widgetConfig.fontFamily}
                                onChange={onChange}
                                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                            >
                                <option value="Helvetica Neue, Helvetica, Arial, sans-serif">Helvetica</option>
                                <option value="'Roboto', sans-serif">Roboto</option>
                                <option value="'Open Sans', sans-serif">Open Sans</option>
                                <option value="'Lato', sans-serif">Lato</option>
                                <option value="'Arial', sans-serif">Arial</option>
                            </select>
                        </div>
                    </div>

                    <WidgetPreview widgetConfig={widgetConfig} />
                </CardContent>
            </Card>
        </div>
    );
}

interface ColorFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    helpText?: string;
}

function ColorField({ label, name, value, onChange, helpText }: ColorFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <div className="flex items-center mt-1">
                <input
                    type="color"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="h-10 w-14"
                />
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                />
            </div>
            {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
        </div>
    );
}

interface NumberFieldProps {
    label: string;
    name: string;
    min: string;
    max: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function NumberField({ label, name, min, max, value, onChange }: NumberFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                name={name}
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            />
        </div>
    );
}

interface TextFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function TextField({ label, name, value, onChange }: TextFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            />
        </div>
    );
}

interface WidgetPreviewProps {
    widgetConfig: WidgetConfig;
}

function WidgetPreview({ widgetConfig }: WidgetPreviewProps) {
    return (
        <div className="mt-8">
            <div className="border border-gray-700 rounded-md p-4">
                <div className="mb-2 text-sm font-medium">Widget Preview</div>
                <div
                    className="relative bg-gray-800 rounded-md flex items-center justify-center"
                    style={{
                        height: `${Number(widgetConfig.windowHeight) * 0.5 + 64}px`,
                        minHeight: `${Number(widgetConfig.buttonSize) * 0.7 + 64}px`
                    }}
                >
                    <div className="relative h-full w-full overflow-hidden">
                        {/* Chat Window Preview */}
                        <div
                            className="bg-[#2a3349] shadow-md rounded-md absolute right-8 bottom-8"
                            style={{
                                width: `${Number(widgetConfig.windowWidth) * 0.5}px`,
                                height: `${Number(widgetConfig.windowHeight) * 0.5}px`,
                                transformOrigin: 'bottom right'
                            }}
                        >
                            <div
                                className="p-2 rounded-t-md text-white text-sm flex justify-between items-center"
                                style={{ backgroundColor: widgetConfig.primaryColor }}
                            >
                                <span>{widgetConfig.headerText}</span>
                                <span>×</span>
                            </div>
                            {/* Chat Messages Preview */}
                            <div className="bg-gray-800 h-4/5 p-2 overflow-y-auto">
                                <div className="flex justify-start mb-2">
                                    <div
                                        className="bg-gray-600 rounded-lg p-2 max-w-[70%]"
                                        style={{ color: '#fff' }}
                                    >
                                        How can I help you?
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div
                                        className="rounded-lg p-2 max-w-[70%]"
                                        style={{
                                            backgroundColor: widgetConfig.secondaryColor,
                                            color: '#000'
                                        }}
                                    >
                                        Sample question
                                    </div>
                                </div>
                            </div>
                            <div className="p-1 border-t border-gray-700"></div>
                        </div>

                        {/* Chat Button Preview */}
                        <div
                            className="absolute right-4 bottom-4 flex items-center justify-center text-white font-bold rounded-full shadow-md"
                            style={{
                                backgroundColor: widgetConfig.primaryColor,
                                width: `${Number(widgetConfig.buttonSize) * 0.7}px`,
                                height: `${Number(widgetConfig.buttonSize) * 0.7}px`
                            }}
                        >
                            +
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}