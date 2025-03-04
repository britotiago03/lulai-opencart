"use client";

import React, { useState } from "react";
import { StripePaymentData } from "@/types/payment";

interface StripePaymentFormProps {
    onSubmitAction: (paymentData: StripePaymentData) => void;
    isSubmitting: boolean;
    amount: number;
}

export function StripePaymentForm({ onSubmitAction, isSubmitting, amount }: StripePaymentFormProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatCardNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Add space after every 4 digits
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

        // Limit to 19 characters (16 digits + 3 spaces)
        return formatted.slice(0, 19);
    };

    const formatExpiryDate = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Format as MM/YY
        if (digits.length > 2) {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
        }
        return digits;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCardNumber(e.target.value);
        setCardNumber(formattedValue);

        // Clear error when editing
        if (errors.cardNumber) {
            setErrors({ ...errors, cardNumber: '' });
        }
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatExpiryDate(e.target.value);
        setExpiryDate(formattedValue);

        // Clear error when editing
        if (errors.expiryDate) {
            setErrors({ ...errors, expiryDate: '' });
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Limit to 3-4 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCvv(value);

        // Clear error when editing
        if (errors.cvv) {
            setErrors({ ...errors, cvv: '' });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Basic card number validation
        if (!cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required';
            isValid = false;
        } else if (cardNumber.replace(/\s/g, '').length < 16) {
            newErrors.cardNumber = 'Please enter a valid card number';
            isValid = false;
        }

        // Cardholder name validation
        if (!cardName.trim()) {
            newErrors.cardName = 'Cardholder name is required';
            isValid = false;
        }

        // Expiry date validation
        if (!expiryDate.trim()) {
            newErrors.expiryDate = 'Expiry date is required';
            isValid = false;
        } else if (expiryDate.length < 5) {
            newErrors.expiryDate = 'Please enter a valid expiry date';
            isValid = false;
        } else {
            // Check if date is valid (not expired)
            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
            const currentMonth = currentDate.getMonth() + 1; // 1-12

            const expiryMonth = parseInt(month, 10);
            const expiryYear = parseInt(year, 10);

            if (expiryMonth < 1 || expiryMonth > 12) {
                newErrors.expiryDate = 'Invalid month';
                isValid = false;
            } else if (expiryYear < currentYear ||
                (expiryYear === currentYear && expiryMonth < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
                isValid = false;
            }
        }

        // CVV validation
        if (!cvv.trim()) {
            newErrors.cvv = 'CVV is required';
            isValid = false;
        } else if (cvv.length < 3) {
            newErrors.cvv = 'Please enter a valid CVV';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // In a real application, you would use Stripe.js to securely
            // handle card details and get a payment token.
            // Here we're simulating that process for demonstration.

            onSubmitAction({
                paymentMethod: 'stripe',
                // Don't send full card details in a real app, only a token from Stripe
                last4: cardNumber.replace(/\s/g, '').slice(-4),
                // Other metadata you might send
                cardholderName: cardName,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242, any future date, any 3 digits for CVV, and any name.
                </p>
            </div>

            <div>
                <label htmlFor="cardNumber" className="block text-gray-700 mb-1">Card Number</label>
                <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={`w-full p-2 border rounded ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    maxLength={19}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div>
                <label htmlFor="cardName" className="block text-gray-700 mb-1">Cardholder Name</label>
                <input
                    type="text"
                    id="cardName"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => {
                        setCardName(e.target.value);
                        if (errors.cardName) setErrors({ ...errors, cardName: '' });
                    }}
                    className={`w-full p-2 border rounded ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="expiryDate" className="block text-gray-700 mb-1">Expiry Date</label>
                    <input
                        type="text"
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        className={`w-full p-2 border rounded ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                        maxLength={5}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                </div>

                <div>
                    <label htmlFor="cvv" className="block text-gray-700 mb-1">CVV</label>
                    <input
                        type="text"
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                        className={`w-full p-2 border rounded ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                        maxLength={4}
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
}