import { randomBytes } from "crypto";

export function generateAPIkey(length = 32): string {
    const apiKey = randomBytes(length).toString('hex');
    console.log("Your API key: ", apiKey);

    return apiKey;
}

generateAPIkey();