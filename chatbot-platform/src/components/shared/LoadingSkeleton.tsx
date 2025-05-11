// src/components/shared/LoadingSkeleton.tsx
export default function LoadingSkeleton() {
    return (
        <div
            data-testid="loading"
            className="w-full h-screen flex flex-col items-center justify-center bg-[#0f1729] text-white"
        >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-lg">Loading...</p>
        </div>
    );
}
