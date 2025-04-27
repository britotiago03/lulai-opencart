// src/hooks/useAdminSettings.ts
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
    PlatformSettings,
    GeneralSettings,
    SecuritySettings,
    EmailSettings,
    AdminSettings
} from "@/types/admin-settings";

const defaultSettings: PlatformSettings = {
    general: {
        platformName: "LulAI",
        supportEmail: "support@lulai.io",
        maintenanceMode: false,
    },
    security: {
        minPasswordLength: 8,
        mfaRequired: false,
        sessionTimeout: 60,
    },
    email: {
        smtpServer: "smtp.lulai.io",
        smtpPort: 587,
        smtpUsername: "notifications@lulai.io",
        smtpPassword: "••••••••••••",
    },
    admin: {
        invitationExpiry: 7,
        ipRestrictions: "",
    },
};

export default function useAdminSettings() {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [saving, setSaving] = useState(false);

    const updateGeneralSettings = (generalSettings: GeneralSettings) => {
        setSettings({
            ...settings,
            general: generalSettings,
        });
    };

    const updateSecuritySettings = (securitySettings: SecuritySettings) => {
        setSettings({
            ...settings,
            security: securitySettings,
        });
    };

    const updateEmailSettings = (emailSettings: EmailSettings) => {
        setSettings({
            ...settings,
            email: emailSettings,
        });
    };

    const updateAdminSettings = (adminSettings: AdminSettings) => {
        setSettings({
            ...settings,
            admin: adminSettings,
        });
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // In a real app, you would send a request to save settings
            // await fetch('/api/admin/settings', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(settings)
            // });

            toast({
                title: "Settings saved",
                description: "Your settings have been successfully updated.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error saving settings",
                description: "An error occurred while saving your settings.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return {
        settings,
        saving,
        updateGeneralSettings,
        updateSecuritySettings,
        updateEmailSettings,
        updateAdminSettings,
        saveSettings,
    };
}