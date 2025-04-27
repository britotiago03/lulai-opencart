'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import { AdminSettings } from "@/types/admin-settings";

interface AdminAccessFormProps {
    settings: AdminSettings;
    changeAction: (settings: AdminSettings) => void;
}

export default function AdminAccessForm({ settings, changeAction }: AdminAccessFormProps) {
    const handleChange = (field: keyof AdminSettings, value: number | string) => {
        changeAction({
            ...settings,
            [field]: value,
        });
    };

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Admin Access Control
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="invitation-expiry">
                        Admin Invitation Expiry (days)
                    </Label>
                    <Input
                        id="invitation-expiry"
                        type="number"
                        min={1}
                        max={30}
                        value={settings.invitationExpiry}
                        onChange={(e) => handleChange('invitationExpiry', parseInt(e.target.value) || 0)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                </div>

                <div className="space-y-2">
                    <Label>IP Access Restrictions</Label>
                    <Textarea
                        placeholder="Enter IP addresses or CIDR ranges (one per line) to restrict admin access"
                        value={settings.ipRestrictions || ''}
                        onChange={(e) => handleChange('ipRestrictions', e.target.value)}
                        className="bg-[#0f1729] border-[#232b3c]"
                    />
                    <p className="text-sm text-gray-400">
                        Leave empty to allow access from any IP address
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}