"use client";

export default function LoadingSkeleton() {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <div className="mt-4">Loading...</div>
            </div>
        </div>
    );
}