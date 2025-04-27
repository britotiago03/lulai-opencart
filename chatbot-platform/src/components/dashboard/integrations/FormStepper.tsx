// src/components/dashboard/integrations/FormStepper.tsx

interface FormStepperProps {
    currentStep: number;
    steps: string[];
}

export default function FormStepper({ currentStep, steps }: FormStepperProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = index + 1 === currentStep;
                    const isCompleted = index + 1 < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center w-full">
                            {/* Connector line */}
                            {index > 0 && (
                                <div
                                    className={`hidden sm:block h-0.5 w-full -mt-3 ${
                                        isCompleted ? 'bg-blue-500' : 'bg-gray-700'
                                    }`}
                                    style={{ marginLeft: '-50%', marginRight: '50%' }}
                                />
                            )}

                            {/* Step circle */}
                            <div
                                className={`z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : isCompleted
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {isCompleted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Step label */}
                            <p
                                className={`mt-2 text-xs sm:text-sm text-center ${
                                    isActive
                                        ? 'text-blue-500'
                                        : isCompleted
                                            ? 'text-white'
                                            : 'text-gray-500'
                                }`}
                            >
                                {step}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}