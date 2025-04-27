"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import useAdminSettings from "@/hooks/useAdminSettings";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SettingsLayout from "@/components/admin-dashboard/settings/SettingsLayout";
import GeneralSettingsForm from "@/components/admin-dashboard/settings/GeneralSettingsForm";
import SecuritySettingsForm from "@/components/admin-dashboard/settings/SecuritySettingsForm";
import EmailSettingsForm from "@/components/admin-dashboard/settings/EmailSettingsForm";
import AdminAccessForm from "@/components/admin-dashboard/settings/AdminAccessForm";
import SaveSettingsButton from "@/components/admin-dashboard/settings/SaveSettingsButton";

export default function AdminSettingsPage() {
    const { isLoading, isAdmin } = useAdminAuth();
    const {
        settings,
        saving,
        updateGeneralSettings,
        updateSecuritySettings,
        updateEmailSettings,
        updateAdminSettings,
        saveSettings,
    } = useAdminSettings();

    // Show loading while checking auth
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    // Configure the tabs for the settings layout
    const tabs = [
        {
            id: "general",
            label: "General",
            content: (
                <GeneralSettingsForm
                    settings={settings.general}
                    changeAction={updateGeneralSettings}
                />
            ),
        },
        {
            id: "security",
            label: "Security",
            content: (
                <SecuritySettingsForm
                    settings={settings.security}
                    changeAction={updateSecuritySettings}
                />
            ),
        },
        {
            id: "email",
            label: "Email",
            content: (
                <EmailSettingsForm
                    settings={settings.email}
                    changeAction={updateEmailSettings}
                />
            ),
        },
        {
            id: "admin",
            label: "Admin Access",
            content: (
                <AdminAccessForm
                    settings={settings.admin}
                    changeAction={updateAdminSettings}
                />
            ),
        },
    ];

    return (
        <SettingsLayout
            title="Platform Settings"
            description="Configure system-wide settings and preferences"
            tabs={tabs}
            footer={<SaveSettingsButton saving={saving} saveAction={saveSettings} />}
        />
    );
}