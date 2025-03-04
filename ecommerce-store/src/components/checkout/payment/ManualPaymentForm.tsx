"use client";

import React, { useState } from "react";
import { ManualPaymentData } from "@/types/payment";

interface ManualPaymentFormProps {
    onSubmitAction: (paymentData: ManualPaymentData) => void;
    isSubmitting: boolean;
}

export function ManualPaymentForm({ onSubmitAction, isSubmitting }: ManualPaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmitAction({
            paymentMethod: 'manual',
            manualMethod: paymentMethod,
            notes: notes
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-md mb-6">
                <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Your order will be processed after we confirm your payment. You will receive payment instructions by email after placing the order.
                </p>
            </div>

            <div>
                <label htmlFor="manualPaymentMethod" className="block text-gray-700 mb-1">Payment Method</label>
                <select
                    id="manualPaymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="money_order">Money Order</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
            </div>

            <div>
                <label htmlFor="paymentNotes" className="block text-gray-700 mb-1">Additional Notes (Optional)</label>
                <textarea
                    id="paymentNotes"
                    placeholder="Any specific information about your payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                />
            </div>

            <div className="mt-6 bg-gray-100 p-4 rounded">
                <h3 className="font-medium mb-2">Bank Transfer Details</h3>
                <p className="text-sm text-gray-600 mb-1">Account Name: Your Store Name</p>
                <p className="text-sm text-gray-600 mb-1">Bank: Example Bank</p>
                <p className="text-sm text-gray-600 mb-1">Account Number: XXXX-XXXX-XXXX-XXXX</p>
                <p className="text-sm text-gray-600 mb-1">Routing Number: XXXXXXXXX</p>
                <p className="text-sm text-gray-600 mt-3">
                    Please include your order number in the payment reference. Detailed instructions will be sent via email after order placement.
                </p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
        </form>
    );
}