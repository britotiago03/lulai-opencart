// src/components/dashboard/agents/settings/TabNavigation.tsx

interface TabNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
    return (
        <div className="flex border-b border-gray-800 mb-6">
            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === "general"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("general")}
            >
                General
            </button>
            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === "widget"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("widget")}
            >
                Widget Appearance
            </button>
            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === "prompt"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("prompt")}
            >
                Custom Prompt
            </button>
        </div>
    );
}