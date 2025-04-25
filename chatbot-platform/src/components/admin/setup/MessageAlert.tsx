// src/components/admin/setup/MessageAlert.tsx
import React from 'react';

interface AlertProps {
    type: 'error' | 'success';
    message: string;
}

export function MessageAlert({ type, message }: AlertProps) {
    if (!message) return null;

    const styles = type === 'error'
        ? "bg-red-500/10 border border-red-500/50 text-red-500"
        : "bg-green-500/10 border border-green-500/50 text-green-500";

    return (
        <div className={`${styles} px-4 py-3 rounded mb-4`}>
            {message}
        </div>
    );
}
