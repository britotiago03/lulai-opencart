// src/components/dashboard/agents/settings/WidgetSettings.tsx

import React from "react";

interface WidgetSettingsProps {
    widgetConfig: {
        primaryColor: string;
        secondaryColor: string;
        buttonSize: number;
        windowWidth: number;
        windowHeight: number;
        headerText: string;
        fontFamily: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSave: () => void;
    saving?: boolean; // Added saving prop as optional
}

const WidgetSettings: React.FC<WidgetSettingsProps> = ({ widgetConfig, onChange, onSave, saving = false }) => {
    return (
        <div className="rounded-xl text-card-foreground shadow bg-[#1b2539] border-0">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">
                        Primary Color
                    </label>
                    <div className="flex items-center">
                        <input type="color" name="primaryColor" value={widgetConfig.primaryColor} onChange={onChange} />
                        <input
                            id="primaryColor"
                            name="primaryColor"
                            type="text"
                            className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                            value={widgetConfig.primaryColor}
                            onChange={onChange}
                        />
                    </div>
                </div>

                {/* Secondary Color */}
                <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">
                        Secondary Color
                    </label>
                    <div className="flex items-center">
                        <input type="color" name="secondaryColor" value={widgetConfig.secondaryColor} onChange={onChange} />
                        <input
                            id="secondaryColor"
                            name="secondaryColor"
                            type="text"
                            className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                            value={widgetConfig.secondaryColor}
                            onChange={onChange}
                        />
                    </div>
                </div>

                {/* Button Size */}
                <div>
                    <label htmlFor="buttonSize" className="block text-sm font-medium mb-1">
                        Button Size (px)
                    </label>
                    <input
                        id="buttonSize"
                        name="buttonSize"
                        type="number"
                        min={40}
                        max={100}
                        className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        value={widgetConfig.buttonSize}
                        onChange={onChange}
                    />
                </div>

                {/* Window Width */}
                <div>
                    <label htmlFor="windowWidth" className="block text-sm font-medium mb-1">
                        Window Width (px)
                    </label>
                    <input
                        id="windowWidth"
                        name="windowWidth"
                        type="number"
                        min={300}
                        max={500}
                        className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        value={widgetConfig.windowWidth}
                        onChange={onChange}
                    />
                </div>

                {/* Window Height */}
                <div>
                    <label htmlFor="windowHeight" className="block text-sm font-medium mb-1">
                        Window Height (px)
                    </label>
                    <input
                        id="windowHeight"
                        name="windowHeight"
                        type="number"
                        min={400}
                        max={700}
                        className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        value={widgetConfig.windowHeight}
                        onChange={onChange}
                    />
                </div>

                {/* Header Text */}
                <div>
                    <label htmlFor="headerText" className="block text-sm font-medium mb-1">
                        Header Text
                    </label>
                    <input
                        id="headerText"
                        name="headerText"
                        type="text"
                        className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        value={widgetConfig.headerText}
                        onChange={onChange}
                    />
                </div>

                {/* Font Family */}
                <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium mb-1">
                        Font Family
                    </label>
                    <select
                        id="fontFamily"
                        name="fontFamily"
                        className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                        value={widgetConfig.fontFamily}
                        onChange={onChange}
                    >
                        <option value="Helvetica Neue, Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Open Sans', sans-serif">Open Sans</option>
                        <option value="'Lato', sans-serif">Lato</option>
                        <option value="'Arial', sans-serif">Arial</option>
                    </select>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end p-6">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={`px-4 py-2 ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center`}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default WidgetSettings;