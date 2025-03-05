export async function validateApiKey(apiKey: string): Promise<boolean> {
    // Replace this with your actual logic to validate the API key
    const validApiKeys = ["ce037f49b37f318f1b7212ae33808eb23cfc68a9009bf6568a1df8a6a23f9e3f", "d5e21c36c44efa14fe6d93097d9421535cb509ddffe6b36b2ca782567dff14e7"];
    return validApiKeys.includes(apiKey);
}