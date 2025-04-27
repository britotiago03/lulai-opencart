// src/app/admin/setup/page.tsx
"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTokenValidation } from '@/hooks/useTokenValidation';
import { useAdminSetup } from '@/hooks/useAdminSetup';
import { LoadingState } from '@/components/admin/setup/LoadingState';
import { ErrorState } from '@/components/admin/setup/ErrorState';
import { SetupForm } from '@/components/admin/setup/SetupForm';

export default function AdminSetupPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const { isValidating, error: validationError, adminData } = useTokenValidation(token);
    const { loading, error: setupError, message, handleSubmit } = useAdminSetup();

    if (isValidating) {
        return <LoadingState />;
    }

    if (validationError && !adminData.name && !adminData.email) {
        return <ErrorState error={validationError} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <SetupForm
                    name={adminData.name}
                    email={adminData.email}
                    token={adminData.token}
                    loading={loading}
                    error={setupError}
                    message={message}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}