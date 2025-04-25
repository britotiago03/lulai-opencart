// src/components/admin/setup/LoadingState.tsx
import React from 'react';

export function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md text-center">
                <div className="animate-spin text-blue-500 text-4xl mb-4">⟳</div>
                <p className="text-white">Validating your invitation...</p>
            </div>
        </div>
    );
}