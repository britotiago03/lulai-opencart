// src/hooks/integration/useFormState.ts
import React, { useState } from "react";
import { IntegrationFormData, WidgetConfig, StoreDetailsErrors } from "@/types/integrations";

export function useFormState() {
    // Form data state
    const [formData, setFormData] = useState<IntegrationFormData>({
        storeName: "",
        productApiUrl: "",
        platform: "",
        apiKey: "",
        industry: "",
        customPrompt: "",
    });

    // Widget configuration state
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
        primaryColor: "#007bff",
        secondaryColor: "#e0f7fa",
        buttonSize: "60",
        windowWidth: "360",
        windowHeight: "500",
        headerText: "Chat with us",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    });

    // Validation errors state
    const [errors, setErrors] = useState<StoreDetailsErrors>({
        storeName: "",
        productApiUrl: "",
        industry: "",
        apiKey: "",
    });

    // Handle form field changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (value.trim() !== "") {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle widget configuration changes
    const handleWidgetConfigChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setWidgetConfig((prev) => ({ ...prev, [name]: value }));
    };

    // Generate a random API key
    const generateApiKey = () => {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);

        let key = Array.from(array, byte =>
            byte.toString(16).padStart(2, '0')
        ).join('');

        if (!/^[a-zA-Z]/.test(key)) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            key = letters[Math.floor(Math.random() * letters.length)] + key.slice(1);
        }

        setFormData((prev) => ({ ...prev, apiKey: key }));
    };

    return {
        formData,
        setFormData,
        widgetConfig,
        errors,
        setErrors,
        handleChange,
        handleWidgetConfigChange,
        generateApiKey
    };
}