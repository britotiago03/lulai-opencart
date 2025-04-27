'use client';

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveSettingsButtonProps {
    saving: boolean;
    saveAction: () => void;
}

export default function SaveSettingsButton({ saving, saveAction }: SaveSettingsButtonProps) {
    return (
        <div className="mt-8 flex justify-end">
            <Button
                onClick={saveAction}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
            >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    );
}