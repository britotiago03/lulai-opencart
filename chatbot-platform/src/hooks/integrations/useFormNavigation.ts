// src/hooks/integration/useFormNavigation.ts
import React, { useState } from "react";
import { IntegrationFormData, StoreDetailsErrors } from "@/types/integrations";

interface UseFormNavigationProps {
    formData: IntegrationFormData;
    setErrors: React.Dispatch<React.SetStateAction<StoreDetailsErrors>>;
}

export function useFormNavigation({ formData, setErrors }: UseFormNavigationProps) {
    const [step, setStep] = useState(1);

    // Handle platform selection
    const handlePlatformSelect = (platform: string) => {
        // Update the form with selected platform and move to next step
        setStep(2);
        return platform; // Return for the caller to update formData
    };

    // Validation for step 2
    const validateStoreDetails = (): boolean => {
        let valid = true;
        const newErrors = { storeName: "", productApiUrl: "", industry: "", apiKey: "" };

        if (!formData.storeName.trim()) {
            newErrors.storeName = "Store name cannot be empty";
            valid = false;
        }
        if (!formData.productApiUrl.trim()) {
            newErrors.productApiUrl = "Product API URL cannot be empty";
            valid = false;
        }
        if (!formData.industry.trim()) {
            newErrors.industry = "Please select an industry";
            valid = false;
        }
        if (!formData.apiKey.trim()) {
            newErrors.apiKey = "Generate an API Key to continue";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Navigation: Next step
    const handleNext = () => {
        // Validate based on current step
        if (step === 2 && !validateStoreDetails()) {
            return;
        }

        // If validation passed, proceed to next step
        setStep(step + 1);
    };

    // Navigation: Previous step
    const handlePrevious = () => {
        setStep(step - 1);
    };

    return {
        step,
        handlePlatformSelect,
        handleNext,
        handlePrevious
    };
}