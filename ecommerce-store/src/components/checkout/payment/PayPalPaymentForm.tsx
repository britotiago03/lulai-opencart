"use client";

import React, { useState } from "react";
import { PayPalPaymentData } from "@/types/payment";

interface PayPalPaymentFormProps {
    onSubmitAction: (paymentData: PayPalPaymentData) => void;
    isSubmitting: boolean;
    amount: number;
}

export function PayPalPaymentForm({ onSubmitAction, isSubmitting, amount }: PayPalPaymentFormProps) {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'PayPal email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // In a real app, you would redirect to PayPal for checkout
            // or use PayPal's JavaScript SDK to initiate the payment
            onSubmitAction({
                paymentMethod: 'paypal',
                email: email,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-sm text-blue-800">
                    You will be redirected to PayPal to complete your payment securely.
                </p>
            </div>

            <div>
                <label htmlFor="paypalEmail" className="block text-gray-700 mb-1">PayPal Email</label>
                <input
                    type="email"
                    id="paypalEmail"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="flex items-center mt-4">
                <div className="bg-gray-100 p-4 rounded w-full">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold">${amount.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        By clicking the button below, you will be redirected to PayPal to complete your purchase securely.
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? 'Processing...' : 'Continue to PayPal'}
            </button>
        </form>
    );
}