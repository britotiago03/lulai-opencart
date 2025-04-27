// components/admin/signin/TokenValidationScreen.tsx
import React from "react";

interface TokenValidationScreenProps {
    error: string;
}

export default function TokenValidationScreen({ error }: TokenValidationScreenProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <span className="text-3xl font-bold text-white">LulAI Admin</span>
                </div>
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Verifying Admin Access
                    </h2>

                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="animate-spin text-blue-500 text-4xl mb-4">⟳</div>
                            <p className="text-white">Validating your secure admin access link...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}