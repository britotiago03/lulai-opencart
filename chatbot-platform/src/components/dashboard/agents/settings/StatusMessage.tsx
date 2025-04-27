// src/components/dashboard/agents/settings/StatusMessage.tsx
import { AlertCircle, Settings } from "lucide-react";

interface StatusMessageProps {
    error: string | null;
    success: string | null;
}

export default function StatusMessage({ error, success }: StatusMessageProps) {
    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-900/30 text-red-500 p-4 rounded-md mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    if (success) {
        return (
            <div className="bg-green-900/20 border border-green-900/30 text-green-500 p-4 rounded-md mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {success}
            </div>
        );
    }

    return null;
}