// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(number: number): string {
    return new Intl.NumberFormat().format(number);
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

export function formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function generateApiKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let result = '';

    // Ensure first character is a letter
    result += characters.charAt(Math.floor(Math.random() * 52)); // First 52 chars are letters

    // Generate the rest of the key
    for (let i = 1; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}