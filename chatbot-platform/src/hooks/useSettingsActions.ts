// src/hooks/useSettingsActions.ts
import { useState } from "react";
import { WidgetConfig } from "@/types/widget-config";

export default function useSettingsActions(id: string, apiKey: string, setApiKey: (key: string) => void) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const saveWidgetConfig = async (widgetConfig: WidgetConfig) => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/chatbots/${id}/widget`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ widgetConfig }),
            });

            if (!response.ok) {
                setError("Failed to update widget configuration");
                return;
            }

            setSuccess("Widget settings saved successfully!");
        } catch (err) {
            console.error("Error saving widget config:", err);
            setError("Failed to save widget settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const saveCustomPrompt = async (customPrompt: string) => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/chatbots/${id}/prompt`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customPrompt }),
            });

            if (!response.ok) {
                setError("Failed to update custom prompt");
                return;
            }

            setSuccess("Custom prompt saved successfully!");
        } catch (err) {
            console.error("Error saving custom prompt:", err);
            setError("Failed to save custom prompt. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const generateNewApiKey = async () => {
        if (confirm("Are you sure you want to generate a new API key? This will invalidate the old one and require updating your widget code.")) {
            try {
                setSaving(true);
                setError(null);
                setSuccess(null);

                const response = await fetch(`/api/chatbots/${id}/regenerate-api-key`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    setError("Failed to regenerate API key");
                    return;
                }

                const data = await response.json();
                setApiKey(data.apiKey);
                setSuccess("API key regenerated successfully! Don't forget to update your widget code.");
            } catch (err) {
                console.error("Error regenerating API key:", err);
                setError("Failed to regenerate API key. Please try again.");
            } finally {
                setSaving(false);
            }
        }
    };

    const copyApiKey = () => {
        void navigator.clipboard.writeText(apiKey);
        setSuccess("API key copied to clipboard!");
    };

    const copyInstallationCode = () => {
        void navigator.clipboard.writeText(
            `<script src="${window.location.origin}/widgets/lulai-widget-${apiKey.substring(0, 10)}.js"></script>
<lulai-chat-widget 
  api-endpoint="${process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3005"}/api/chat"
  api-key="${apiKey}"
></lulai-chat-widget>`
        );
        setSuccess("Installation code copied to clipboard!");
    };

    return {
        saving,
        error,
        success,
        saveWidgetConfig,
        saveCustomPrompt,
        generateNewApiKey,
        copyApiKey,
        copyInstallationCode,
        setError,
        setSuccess
    };
}