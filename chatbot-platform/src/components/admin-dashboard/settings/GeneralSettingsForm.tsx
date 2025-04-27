'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { GeneralSettings } from "@/types/admin-settings";

interface GeneralSettingsFormProps {
    settings: GeneralSettings;
    changeAction: (settings: GeneralSettings) => void;
}

export default function GeneralSettingsForm({ settings, changeAction }: GeneralSettingsFormProps) {
    const handleChange = (field: keyof GeneralSettings, value: string | boolean) => {
        changeAction({
            ...settings,
            [field]: value,
        });
    };

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    General Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input
                        id="platform-name"
                        value={settings.platformName}
                        onChange={(e) => handleChange('platformName', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                        id="support-email"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="maintenance-mode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
                    />
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                </div>
            </CardContent>
        </Card>
    );
}