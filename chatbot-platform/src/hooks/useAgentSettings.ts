// src//hooks/useAgentSettings.ts
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WidgetConfig } from "@/types/widget-config";

export default function useAgentSettings(id: string) {
    const router = useRouter();
    const { status } = useSession();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [chatbotName, setChatbotName] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [chatbotDescription, setChatbotDescription] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
        primaryColor: "#007bff",
        secondaryColor: "#e0f7fa",
        buttonSize: "60",
        windowWidth: "360",
        windowHeight: "500",
        headerText: "Chat with us",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchChatbotData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch chatbot details
                const response = await fetch(`/api/chatbots/${id}`);
                if (!response.ok) {
                    setError("Failed to fetch chatbot details");
                    return;
                }

                const chatbotData = await response.json();
                setChatbotName(chatbotData.name);
                setChatbotDescription(chatbotData.description);
                setApiKey(chatbotData.api_key);
                setCustomPrompt(chatbotData.custom_prompt || "");

                // Fetch widget configuration
                const widgetResponse = await fetch(`/api/chatbots/${id}/widget`);
                if (widgetResponse.ok) {
                    const widgetData = await widgetResponse.json();
                    setWidgetConfig({
                        primaryColor: widgetData.primary_color || "#007bff",
                        secondaryColor: widgetData.secondary_color || "#e0f7fa",
                        buttonSize: widgetData.button_size?.toString() || "60",
                        windowWidth: widgetData.window_width?.toString() || "360",
                        windowHeight: widgetData.window_height?.toString() || "500",
                        headerText: widgetData.header_text || "Chat with us",
                        fontFamily: widgetData.font_family || "Helvetica Neue, Helvetica, Arial, sans-serif",
                    });
                }
            } catch (err) {
                console.error("Error fetching chatbot data:", err);
                setError("Failed to load chatbot settings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated" && id) {
            void fetchChatbotData();
        }
    }, [id, status, router]);

    const handleWidgetConfigChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setWidgetConfig((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return {
        loading,
        error,
        chatbotName,
        apiKey,
        setApiKey,
        chatbotDescription,
        customPrompt,
        setCustomPrompt,
        widgetConfig,
        handleWidgetConfigChange,
    };
}