"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Save,
    Shield,
    MailWarning,
    Lock,
} from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Remove unused imports
// User, Database, Server are not used in this component

export default function AdminSettingsPage() {
    const { isLoading, isAdmin } = useAdminAuth();

    // General settings
    const [platformName, setPlatformName] = useState("LulAI");
    const [supportEmail, setSupportEmail] = useState("support@lulai.io");
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Security settings
    const [minPasswordLength, setMinPasswordLength] = useState(8);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(60);

    // Email settings
    const [smtpServer, setSmtpServer] = useState("smtp.lulai.io");
    const [smtpPort, setSmtpPort] = useState(587);
    const [smtpUsername, setSmtpUsername] = useState("notifications@lulai.io");
    const [smtpPassword, setSmtpPassword] = useState("••••••••••••");

    // Admin invitation settings
    const [invitationExpiry, setInvitationExpiry] = useState(7);

    // Saving settings
    const [saving, setSaving] = useState(false);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // In a real app, you would send a request to save settings
            // await fetch('/api/admin/settings', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     general: { platformName, supportEmail, maintenanceMode },
            //     security: { minPasswordLength, mfaRequired, sessionTimeout },
            //     email: { smtpServer, smtpPort, smtpUsername, smtpPassword },
            //     admin: { invitationExpiry }
            //   })
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

    // Show loading while checking auth
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Platform Settings</h1>
                <p className="text-gray-400 mt-1">
                    Configure system-wide settings and preferences
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 bg-[#1b2539]">
                    <TabsTrigger value="general" className="data-[state=active]:bg-[#232b3c]">
                        General
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-[#232b3c]">
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="email" className="data-[state=active]:bg-[#232b3c]">
                        Email
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="data-[state=active]:bg-[#232b3c]">
                        Admin Access
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
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
                                    value={platformName}
                                    onChange={(e) => setPlatformName(e.target.value)}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="support-email">Support Email</Label>
                                <Input
                                    id="support-email"
                                    type="email"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="maintenance-mode"
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
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
                                    value={minPasswordLength}
                                    onChange={(e) => setMinPasswordLength(parseInt(e.target.value))}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="mfa-required"
                                    checked={mfaRequired}
                                    onCheckedChange={setMfaRequired}
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
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email">
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
                                    value={smtpServer}
                                    onChange={(e) => setSmtpServer(e.target.value)}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtp-port">SMTP Port</Label>
                                <Input
                                    id="smtp-port"
                                    type="number"
                                    value={smtpPort}
                                    onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtp-username">SMTP Username</Label>
                                <Input
                                    id="smtp-username"
                                    value={smtpUsername}
                                    onChange={(e) => setSmtpUsername(e.target.value)}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtp-password">SMTP Password</Label>
                                <Input
                                    id="smtp-password"
                                    type="password"
                                    value={smtpPassword}
                                    onChange={(e) => setSmtpPassword(e.target.value)}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Admin Access Settings */}
                <TabsContent value="admin">
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
                                    value={invitationExpiry}
                                    onChange={(e) => setInvitationExpiry(parseInt(e.target.value))}
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>IP Access Restrictions</Label>
                                <Textarea
                                    placeholder="Enter IP addresses or CIDR ranges (one per line) to restrict admin access"
                                    className="bg-[#0f1729] border-[#232b3c]"
                                />
                                <p className="text-sm text-gray-400">
                                    Leave empty to allow access from any IP address
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
                <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}