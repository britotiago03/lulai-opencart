// src/components/dashboard/agents/settings/WidgetSettings.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { WidgetConfig } from "@/types/widget-config";
import WidgetPreview from "./WidgetPreview";
import React from "react";

interface WidgetSettingsProps {
    widgetConfig: WidgetConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

export default function WidgetSettings({
                                           widgetConfig,
                                           onChange,
                                           onSave,
                                           saving
                                       }: WidgetSettingsProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Primary Color</label>
                        <div className="flex items-center">
                            <input
                                type="color"
                                name="primaryColor"
                                value={widgetConfig.primaryColor}
                                onChange={onChange}
                                className="h-10 w-14"
                            />
                            <input
                                type="text"
                                name="primaryColor"
                                value={widgetConfig.primaryColor}
                                onChange={onChange}
                                className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Used for chat button and header.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Secondary Color</label>
                        <div className="flex items-center">
                            <input
                                type="color"
                                name="secondaryColor"
                                value={widgetConfig.secondaryColor}
                                onChange={onChange}
                                className="h-10 w-14"
                            />
                            <input
                                type="text"
                                name="secondaryColor"
                                value={widgetConfig.secondaryColor}
                                onChange={onChange}
                                className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Used for user message bubbles.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Button Size (px)</label>
                        <input
                            type="number"
                            name="buttonSize"
                            value={widgetConfig.buttonSize}
                            onChange={onChange}
                            min="40"
                            max="100"
                            className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Window Width (px)</label>
                        <input
                            type="number"
                            name="windowWidth"
                            value={widgetConfig.windowWidth}
                            onChange={onChange}
                            min="300"
                            max="500"
                            className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Window Height (px)</label>
                        <input
                            type="number"
                            name="windowHeight"
                            value={widgetConfig.windowHeight}
                            onChange={onChange}
                            min="400"
                            max="700"
                            className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Header Text</label>
                        <input
                            type="text"
                            name="headerText"
                            value={widgetConfig.headerText}
                            onChange={onChange}
                            className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Font Family</label>
                        <select
                            name="fontFamily"
                            value={widgetConfig.fontFamily}
                            onChange={onChange}
                            className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
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

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin mr-2">⟳</span> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}