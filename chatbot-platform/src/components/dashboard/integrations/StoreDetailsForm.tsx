// src/components/dashboard/integrations/StoreDetailsForm.tsx
import { Card, CardContent } from "@/components/ui/card";
import { IntegrationFormData } from "@/types/integrations";
import React from "react";

interface StoreDetailsFormProps {
    formData: IntegrationFormData;
    errors: {
        storeName: string;
        productApiUrl: string;
        industry: string;
        apiKey: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onGenerateApiKey: () => void;
}

export default function StoreDetailsForm({
                                             formData,
                                             errors,
                                             onChange,
                                             onGenerateApiKey
                                         }: StoreDetailsFormProps) {
    const industries = ["fashion", "electronics", "general", "food", "beauty"];

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Enter Store Details</h2>
            <Card className="shadow-lg bg-[#1b2539] border-0">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Store Name"
                            name="storeName"
                            type="text"
                            value={formData.storeName}
                            onChange={onChange}
                            error={errors.storeName}
                        />

                        <FormField
                            label="Product API URL"
                            name="productApiUrl"
                            type="url"
                            value={formData.productApiUrl}
                            onChange={onChange}
                            error={errors.productApiUrl}
                        />

                        <div>
                            <label className="block text-sm font-medium">Industry</label>
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={onChange}
                                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                            >
                                <option value="">Select an Industry</option>
                                {industries.map((industry) => (
                                    <option key={industry} value={industry}>
                                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.industry && (
                                <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">API Key</label>
                            <div className="flex space-x-2">
                                <input
                                    name="apiKey"
                                    type="text"
                                    value={formData.apiKey}
                                    onChange={onChange}
                                    readOnly
                                    placeholder="Click generate to create API key"
                                    className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#232b3c]"
                                />
                                <button
                                    type="button"
                                    onClick={onGenerateApiKey}
                                    className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Generate API Key
                                </button>
                            </div>
                            {errors.apiKey && (
                                <p className="text-red-500 text-sm mt-1">{errors.apiKey}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    error?: string;
}

function FormField({ label, name, type, value, onChange, error }: FormFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}