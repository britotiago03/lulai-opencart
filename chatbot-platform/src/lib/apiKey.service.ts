export async function validateApiKey(apiKey: string): Promise<boolean> {
    // Replace this with your actual logic to validate the API key
    const validApiKeys = ["admin1-api-key", "admin2-api-key"];
    return validApiKeys.includes(apiKey);
}