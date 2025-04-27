// src/app/dashboard/agents/[id]/settings/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import Link from "next/link";

// Components
import GeneralSettings from "@/components/dashboard/agents/settings/GeneralSettings";
import WidgetSettings from "@/components/dashboard/agents/settings/WidgetSettings";
import CustomPromptSettings from "@/components/dashboard/agents/settings/CustomPromptSettings";
import TabNavigation from "@/components/dashboard/agents/settings/TabNavigation";
import StatusMessage from "@/components/dashboard/agents/settings/StatusMessage";

// Hooks
import useAgentSettings from "@/hooks/useAgentSettings";
import useSettingsActions from "@/hooks/useSettingsActions";

export default function AgentSettingsPage() {
    const { id } = useParams() as { id: string };
    const [activeTab, setActiveTab] = useState("general");

    // Custom hooks for data and actions
    const {
        loading,
        error: fetchError,
        chatbotName,
        apiKey,
        setApiKey,
        chatbotDescription,
        customPrompt,
        setCustomPrompt,
        widgetConfig,
        handleWidgetConfigChange
    } = useAgentSettings(id);

    const {
        saving,
        error: actionError,
        success,
        saveWidgetConfig,
        saveCustomPrompt,
        generateNewApiKey,
        copyApiKey,
        copyInstallationCode
    } = useSettingsActions(id, apiKey, setApiKey);

    // Combine errors from both hooks
    const error = fetchError || actionError;

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <Link href={`/dashboard/agents`} className="text-blue-500 hover:text-blue-400 mr-2">
                    ← Back to Agents
                </Link>
                <h1 className="text-2xl font-bold">Settings for {chatbotName}</h1>
            </div>

            {(error || success) && (
                <StatusMessage error={error} success={success} />
            )}

            <TabNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {activeTab === "general" && (
                <GeneralSettings
                    chatbotName={chatbotName}
                    chatbotDescription={chatbotDescription}
                    apiKey={apiKey}
                    onCopyApiKey={copyApiKey}
                    onRegenerateApiKey={generateNewApiKey}
                    onCopyInstallationCode={copyInstallationCode}
                />
            )}

            {activeTab === "widget" && (
                <WidgetSettings
                    widgetConfig={widgetConfig}
                    onChange={handleWidgetConfigChange}
                    onSave={() => saveWidgetConfig(widgetConfig)}
                    saving={saving}
                />
            )}

            {activeTab === "prompt" && (
                <CustomPromptSettings
                    customPrompt={customPrompt}
                    onChange={setCustomPrompt}
                    onSave={() => saveCustomPrompt(customPrompt)}
                    saving={saving}
                />
            )}
        </div>
    );
}