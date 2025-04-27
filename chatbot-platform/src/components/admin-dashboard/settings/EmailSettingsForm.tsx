'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailWarning } from "lucide-react";
import { EmailSettings } from "@/types/admin-settings";

interface EmailSettingsFormProps {
    settings: EmailSettings;
    changeAction: (settings: EmailSettings) => void;
}

export default function EmailSettingsForm({ settings, changeAction }: EmailSettingsFormProps) {
    const handleChange = (field: keyof EmailSettings, value: string | number) => {
        changeAction({
            ...settings,
            [field]: value,
        });
    };

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center">
                    <MailWarning className="mr-2 h-5 w-5" />
                    Email Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                        id="smtp-server"
                        value={settings.smtpServer}
                        onChange={(e) => handleChange('smtpServer', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                        id="smtp-port"
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 0)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input
                        id="smtp-username"
                        value={settings.smtpUsername}
                        onChange={(e) => handleChange('smtpUsername', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input
                        id="smtp-password"
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleChange('smtpPassword', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}