// src/hooks/integration/useWidgetBuilder.ts
import { useState } from "react";
import { IntegrationFormData, WidgetConfig } from "@/types/integrations";

export type BuildState = {
    responseMsg: string;
    progress: string[];
    buildingWidget: boolean;
    widgetBuilt: boolean;
    downloadUrl: string | null;
};

export function useWidgetBuilder() {
    // Build state
    const [buildState, setBuildState] = useState<BuildState>({
        responseMsg: "",
        progress: [],
        buildingWidget: false,
        widgetBuilt: false,
        downloadUrl: null,
    });

    // Update progress
    const updateProgress = (message: string) => {
        setBuildState(prev => ({
            ...prev,
            progress: [...prev.progress, message]
        }));
    };

    // Handle build widget process
    const handleBuildWidget = async (formData: IntegrationFormData, widgetConfig: WidgetConfig) => {
        // Initialize build process
        setBuildState({
            buildingWidget: true,
            progress: ["Starting integration process..."],
            responseMsg: "",
            widgetBuilt: false,
            downloadUrl: null
        });

        try {
            // Step 1: Store data in chatbot service
            updateProgress("Saving custom prompt to the Database...");

            const storageRes = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3005"}/api/storage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            // Handle potential error without throwing
            if (!storageRes.ok) {
                setBuildState(prev => ({
                    ...prev,
                    responseMsg: "Failed to store chatbot data",
                    progress: [...prev.progress, "Error storing chatbot data"],
                    buildingWidget: false
                }));
                return;
            }

            // Step 2: Save chatbot details to platform database
            updateProgress("Saving chatbot details to the platform...");

            const chatbotRes = await fetch("/api/chatbots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    widgetConfig
                }),
            });

            // Handle potential error without throwing
            if (!chatbotRes.ok) {
                setBuildState(prev => ({
                    ...prev,
                    responseMsg: "Failed to create chatbot record",
                    progress: [...prev.progress, "Error creating chatbot record"],
                    buildingWidget: false
                }));
                return;
            }

            // Step 3: Generate the widget code
            updateProgress("Building widget package...");

            const widgetRes = await fetch("/api/build-widget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    integration: formData,
                    widgetConfig
                }),
            });

            const widgetData = await widgetRes.json();

            // Handle potential error without throwing
            if (!widgetRes.ok) {
                setBuildState(prev => ({
                    ...prev,
                    responseMsg: widgetData.message || "Widget build failed",
                    progress: [...prev.progress, "Error building widget"],
                    buildingWidget: false
                }));
                return;
            }

            // Success case
            setBuildState({
                downloadUrl: widgetData.downloadUrl,
                widgetBuilt: true,
                responseMsg: "Integration successful!",
                progress: [...buildState.progress, "All systems updated!"],
                buildingWidget: false
            });

        } catch (error) {
            console.error("Integration error:", error);

            // Set error state
            setBuildState(prev => ({
                ...prev,
                responseMsg: error instanceof Error ? error.message : "Integration failed",
                progress: [...prev.progress, "Error occurred during integration"],
                buildingWidget: false
            }));
        }
    };

    return {
        buildState,
        handleBuildWidget
    };
}