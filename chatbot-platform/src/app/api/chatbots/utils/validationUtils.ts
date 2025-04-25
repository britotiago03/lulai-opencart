import { ChatbotCreateInput } from "../types";

export function validateChatbotInput(input: Partial<ChatbotCreateInput>): {
    valid: boolean;
    message?: string
} {
    // Check required fields
    if (!input.storeName) {
        return { valid: false, message: "Store name is required" };
    }

    if (!input.productApiUrl) {
        return { valid: false, message: "Product API URL is required" };
    }

    if (!input.platform) {
        return { valid: false, message: "Platform is required" };
    }

    if (!input.apiKey) {
        return { valid: false, message: "API key is required" };
    }

    if (!input.industry) {
        return { valid: false, message: "Industry is required" };
    }

    // All validations passed
    return { valid: true };
}