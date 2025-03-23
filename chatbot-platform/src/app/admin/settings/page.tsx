// src/app/admin/settings/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Save,
    RefreshCw,
    Shield,
    Mail,
    Globe,
    CreditCard,
    MessageSquare,
    Server,
    Key,
    FileText,
    Bell,
    Trash2,
    AlertTriangle
} from 'lucide-react';

export default function AdminSettingsPage() {
    // General settings
    const [companyName, setCompanyName] = useState('LuIAI');
    const [supportEmail, setSupportEmail] = useState('support@luiai.com');
    const [websiteUrl, setWebsiteUrl] = useState('https://luiai.com');

    // Subscription settings
    const [trialPeriod, setTrialPeriod] = useState(14);
    const [gracePeriod, setGracePeriod] = useState(3);

    // API settings
    const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxxxxxx');
    const [apiUrl, setApiUrl] = useState('https://api.luiai.com');
    const [maxApiCalls, setMaxApiCalls] = useState(10000);

    // Security settings
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [passwordPolicyDays, setPasswordPolicyDays] = useState(90);
    const [minimumPasswordLength, setMinimumPasswordLength] = useState(8);

    // AI settings
    const [openaiApiKey, setOpenaiApiKey] = useState('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    const [defaultModel, setDefaultModel] = useState('gpt-4');
    const [maxTokens, setMaxTokens] = useState(2000);

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [slackWebhook, setSlackWebhook] = useState('');
    const [discordWebhook, setDiscordWebhook] = useState('');

    // Handle form submission
    const handleSubmit = (e: React.FormEvent, section: string) => {
        e.preventDefault();
        // In a real application, this would send the data to an API
        alert(`${section} settings updated successfully!`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

            {/* General Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'General')}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Company Name
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Support Email
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={supportEmail}
                                        onChange={(e) => setSupportEmail(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Website URL
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save General Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Subscription Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>Subscription Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'Subscription')}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Trial Period (days)
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <RefreshCw className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={trialPeriod}
                                        onChange={(e) => setTrialPeriod(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Payment Grace Period (days)
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <CreditCard className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={gracePeriod}
                                        onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <fieldset className="border border-gray-700 rounded-md p-4">
                                <legend className="text-sm font-medium text-gray-400 px-2">Plan Limits</legend>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Basic Plan Chatbots
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={2}
                                            className="w-full p-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Professional Plan Chatbots
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={5}
                                            className="w-full p-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Enterprise Plan Chatbots
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={15}
                                            className="w-full p-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Subscription Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* API Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>API Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'API')}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    API Key
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Key className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    API Base URL
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Server className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Max API Calls per Day
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={maxApiCalls}
                                        onChange={(e) => setMaxApiCalls(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save API Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'Security')}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Require Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-400">Enforce 2FA for all admin users</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={twoFactorRequired}
                                        onChange={() => setTwoFactorRequired(!twoFactorRequired)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Password Reset Period (days)
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={passwordPolicyDays}
                                        onChange={(e) => setPasswordPolicyDays(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Set to 0 to disable password expiration</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Minimum Password Length
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Key className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={minimumPasswordLength}
                                        onChange={(e) => setMinimumPasswordLength(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">IP Restriction</h3>
                                    <p className="text-sm text-gray-400">Limit admin access to specific IP addresses</p>
                                </div>
                                <button
                                    type="button"
                                    className="px-3 py-1 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm"
                                    onClick={() => alert('Configure IP restrictions')}
                                >
                                    Configure
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Security Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* AI Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>AI Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'AI')}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    OpenAI API Key
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Key className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Default AI Model
                                </label>
                                <select
                                    value={defaultModel}
                                    onChange={(e) => setDefaultModel(e.target.value)}
                                    className="w-full p-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="claude-2">Claude 2</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Maximum Token Limit
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <fieldset className="border border-gray-700 rounded-md p-4">
                                <legend className="text-sm font-medium text-gray-400 px-2">Content Filters</legend>

                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            id="filter-profanity"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="filter-profanity" className="ml-2 text-sm">
                                            Filter profanity from AI responses
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="filter-sensitive"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="filter-sensitive" className="ml-2 text-sm">
                                            Filter sensitive or personal information
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="filter-spam"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="filter-spam" className="ml-2 text-sm">
                                            Detect and filter spam or abuse
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save AI Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => handleSubmit(e, 'Notification')}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Email Notifications</h3>
                                    <p className="text-sm text-gray-400">Receive system alerts via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailNotifications}
                                        onChange={() => setEmailNotifications(!emailNotifications)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Slack Webhook URL
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Bell className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={slackWebhook}
                                        onChange={(e) => setSlackWebhook(e.target.value)}
                                        placeholder="https://hooks.slack.com/services/xxx/yyy/zzz"
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Leave blank to disable Slack notifications</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Discord Webhook URL
                                </label>
                                <div className="flex">
                                    <div className="bg-[#232b3c] rounded-l-md p-2 flex items-center border border-gray-700 border-r-0">
                                        <Bell className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={discordWebhook}
                                        onChange={(e) => setDiscordWebhook(e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/xxx/yyy"
                                        className="flex-1 p-2 bg-[#232b3c] border border-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Leave blank to disable Discord notifications</p>
                            </div>

                            <fieldset className="border border-gray-700 rounded-md p-4">
                                <legend className="text-sm font-medium text-gray-400 px-2">Notification Events</legend>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center">
                                        <input
                                            id="notify-new-user"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-new-user" className="ml-2 text-sm">
                                            New user registration
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="notify-subscription"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-subscription" className="ml-2 text-sm">
                                            Subscription changes
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="notify-payment"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-payment" className="ml-2 text-sm">
                                            Payment events
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="notify-error"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-error" className="ml-2 text-sm">
                                            System errors
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="notify-api"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-api" className="ml-2 text-sm">
                                            API usage limits
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="notify-security"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="notify-security" className="ml-2 text-sm">
                                            Security alerts
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Notification Settings
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-[#1b2539] border-0">
                <CardHeader>
                    <CardTitle className="text-red-400 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 border border-gray-700 rounded-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium">Reset All Settings</h3>
                                    <p className="text-sm text-gray-400">Reset all settings to their default values</p>
                                </div>
                                <button
                                    type="button"
                                    className="px-3 py-1 border border-yellow-600 text-yellow-500 rounded-md hover:bg-yellow-900/20 transition-colors"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                                            alert('Settings have been reset');
                                        }
                                    }}
                                >
                                    Reset Settings
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-700 rounded-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium">Purge All Data</h3>
                                    <p className="text-sm text-gray-400">Delete all platform data (cannot be undone)</p>
                                </div>
                                <button
                                    type="button"
                                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                                    onClick={() => {
                                        if (confirm('WARNING: Are you absolutely sure you want to delete all platform data? This action CANNOT be undone.')) {
                                            if (prompt('Type "DELETE ALL DATA" to confirm this destructive action:') === 'DELETE ALL DATA') {
                                                alert('Data purge initiated');
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Purge Data
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}