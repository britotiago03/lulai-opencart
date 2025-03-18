"use client";

import React, { useState } from "react";

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface CheckoutFormProps {
    customerInfo: CustomerInfo;
    onSubmitAction: (info: CustomerInfo) => void;
}

export function CheckoutForm({ customerInfo, onSubmitAction }: CheckoutFormProps) {
    const [formData, setFormData] = useState(customerInfo);
    const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name as keyof CustomerInfo]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
        let isValid = true;

        // Required fields
        const requiredFields: Array<keyof CustomerInfo> = [
            'firstName', 'lastName', 'email', 'phone',
            'address', 'city', 'state', 'zipCode', 'country'
        ];

        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = 'This field is required';
                isValid = false;
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Phone validation (simple check for now)
        if (formData.phone && !/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
            isValid = false;
        }

        // ZIP/Postal code validation (simple check)
        if (formData.zipCode && !/^[0-9a-zA-Z\s\-]+$/.test(formData.zipCode)) {
            newErrors.zipCode = 'Please enter a valid ZIP/postal code';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmitAction(formData);
        }
    };

    // Function to fill the form with example data
    const fillWithExampleData = () => {
        const exampleData: CustomerInfo = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "555-123-4567",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US"
        };

        setFormData(exampleData);
        setErrors({});
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shipping Information</h2>
                <button
                    type="button"
                    onClick={fillWithExampleData}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm transition"
                >
                    Fill with Test Data
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 mb-1">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-gray-700 mb-1">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-gray-700 mb-1">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="address" className="block text-gray-700 mb-1">Street Address *</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label htmlFor="city" className="block text-gray-700 mb-1">City *</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-gray-700 mb-1">State/Province *</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    <div>
                        <label htmlFor="zipCode" className="block text-gray-700 mb-1">ZIP/Postal Code *</label>
                        <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="country" className="block text-gray-700 mb-1">Country *</label>
                    <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        {/* Add more countries as needed */}
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
                >
                    Continue to Payment
                </button>
            </form>
        </div>
    );
}