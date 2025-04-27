'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { SecuritySettings } from "@/types/admin-settings";

interface SecuritySettingsFormProps {
    settings: SecuritySettings;
    changeAction: (settings: SecuritySettings) => void;
}

export default function SecuritySettingsForm({ settings, changeAction }: SecuritySettingsFormProps) {
    const handleChange = (field: keyof SecuritySettings, value: number | boolean) => {
        changeAction({
            ...settings,
            [field]: value,
        });
    };

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="min-password-length">Minimum Password Length</Label>
                    <Input
                        id="min-password-length"
                        type="number"
                        min={6}
                        max={24}
                        value={settings.minPasswordLength}
                        onChange={(e) => handleChange('minPasswordLength', parseInt(e.target.value) || 0)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="mfa-required"
                        checked={settings.mfaRequired}
                        onCheckedChange={(checked) => handleChange('mfaRequired', checked)}
                    />
                    <Label htmlFor="mfa-required">Require MFA for All Users</Label>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                        id="session-timeout"
                        type="number"
                        min={15}
                        max={1440}
                        value={settings.sessionTimeout}
                        onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 0)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}