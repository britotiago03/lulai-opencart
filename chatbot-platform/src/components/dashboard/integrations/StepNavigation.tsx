// src/components/dashboard/integrations/StepNavigation.tsx

interface StepNavigationProps {
    onNext: () => void;
    onPrevious: () => void;
    disableNext: boolean;
    disablePrevious: boolean;
    hideNextButton?: boolean;
}

export default function StepNavigation({
                                           onNext,
                                           onPrevious,
                                           disableNext,
                                           disablePrevious,
                                           hideNextButton = false
                                       }: StepNavigationProps) {
    return (
        <div className="flex justify-between mt-4">
            <button
                type="button"
                onClick={onPrevious}
                disabled={disablePrevious}
                className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Back
            </button>

            {!hideNextButton && (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={disableNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            )}
        </div>
    );
}