// src/types/admin-settings.ts

export interface GeneralSettings {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
}

export interface SecuritySettings {
    minPasswordLength: number;
    mfaRequired: boolean;
    sessionTimeout: number;
}

export interface EmailSettings {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
}

export interface AdminSettings {
    invitationExpiry: number;
    ipRestrictions?: string;
}

export interface PlatformSettings {
    general: GeneralSettings;
    security: SecuritySettings;
    email: EmailSettings;
    admin: AdminSettings;
}