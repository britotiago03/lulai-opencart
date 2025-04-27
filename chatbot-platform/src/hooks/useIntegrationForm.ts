// src/hooks/useIntegrationForm.ts
import { useFormState } from "./integrations/useFormState";
import { useFormNavigation } from "./integrations/useFormNavigation";
import { useWidgetBuilder } from "./integrations/useWidgetBuilder";

export function useIntegrationForm() {
    // Form state management
    const {
        formData,
        setFormData,
        widgetConfig,
        errors,
        setErrors,
        handleChange,
        handleWidgetConfigChange,
        generateApiKey
    } = useFormState();

    // Form navigation management
    const {
        step,
        handlePlatformSelect: baseHandlePlatformSelect,
        handleNext,
        handlePrevious
    } = useFormNavigation({ formData, setErrors });

    // Widget building management
    const { buildState, handleBuildWidget: baseBuildWidget } = useWidgetBuilder();

    // Custom platform selection handler that updates form data
    const handlePlatformSelect = (platform: string) => {
        const selectedPlatform = baseHandlePlatformSelect(platform);
        setFormData(prev => ({ ...prev, platform: selectedPlatform }));
    };

    // Build widget wrapper that passes current form data
    const handleBuildWidget = () => {
        return baseBuildWidget(formData, widgetConfig);
    };

    return {
        step,
        formData,
        widgetConfig,
        errors,
        buildState,
        handleChange,
        handleWidgetConfigChange,
        handlePlatformSelect,
        handleNext,
        handlePrevious,
        generateApiKey,
        handleBuildWidget
    };
}