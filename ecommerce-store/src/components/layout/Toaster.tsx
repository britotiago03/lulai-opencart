// components/layout/Toaster.tsx
"use client";

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                // Default options for all toasts
                duration: 5000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
                // Styles for specific toast types
                success: {
                    duration: 5000,
                    style: {
                        background: '#1E3A8A',
                        color: 'white',
                    },
                },
                error: {
                    duration: 5000,
                    style: {
                        background: '#991B1B',
                        color: 'white',
                    },
                },
            }}
        />
    );
}