// src/components/dashboard/integrations/widget/WidgetPreview.tsx
import React from "react";
import { WidgetPreviewProps } from "./types";

export default function WidgetPreview({ widgetConfig }: WidgetPreviewProps) {
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