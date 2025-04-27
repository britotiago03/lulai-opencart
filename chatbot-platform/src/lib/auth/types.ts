// src/lib/auth/types.ts

// Define the user types enum
export const UserTypes = {
    CLIENT: 'client',
    ADMIN: 'admin'
} as const;

// Interface for user validation result
export interface ValidatedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    isAdmin: boolean;
}