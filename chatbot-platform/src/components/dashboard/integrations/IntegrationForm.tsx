// src/components/dashboard/integrations/IntegrationForm.tsx
import { useIntegrationForm } from "@/hooks/useIntegrationForm";
import FormStepper from "./FormStepper";
import PlatformSelection from "./PlatformSelection";
import StoreDetailsForm from "./StoreDetailsForm";
import CustomPromptForm from "./CustomPromptForm";
import WidgetCustomization from "./WidgetCustomization";
import BuildIntegration from "./BuildIntegration";
import StepNavigation from "./StepNavigation";

export default function IntegrationForm() {
    const {
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
    } = useIntegrationForm();

    const steps = [
        "Platform",
        "Store Details",
        "Custom Prompt",
        "Customize Widget",
        "Build & Integrate"
    ];

    return (
        <div>
            <FormStepper currentStep={step} steps={steps} />

            {/* Step Content */}
            <div className="mb-6">
                {step === 1 && (
                    <PlatformSelection onPlatformSelect={handlePlatformSelect} />
                )}

                {step === 2 && (
                    <StoreDetailsForm
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        onGenerateApiKey={generateApiKey}
                    />
                )}

                {step === 3 && (
                    <CustomPromptForm
                        customPrompt={formData.customPrompt}
                        onChange={handleChange}
                    />
                )}

                {step === 4 && (
                    <WidgetCustomization
                        widgetConfig={widgetConfig}
                        onChange={handleWidgetConfigChange}
                    />
                )}

                {step === 5 && (
                    <BuildIntegration
                        formData={formData}
                        buildingWidget={buildState.buildingWidget}
                        widgetBuilt={buildState.widgetBuilt}
                        progress={buildState.progress}
                        responseMsg={buildState.responseMsg}
                        downloadUrl={buildState.downloadUrl}
                        onBuild={handleBuildWidget}
                    />
                )}
            </div>

            {/* Navigation */}
            {step > 1 && (
                <StepNavigation
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    disableNext={false}
                    disablePrevious={step === 5 && (buildState.buildingWidget || buildState.widgetBuilt)}
                    hideNextButton={step === 5}
                />
            )}
        </div>
    );
}