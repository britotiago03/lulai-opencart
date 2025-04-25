// lib/auth-config.ts
import { NextAuthOptions } from "next-auth";
import { createClientAuthOptions, createAdminAuthOptions } from "./auth/options";

// Export auth options for client users
export const userAuthOptions: NextAuthOptions = createClientAuthOptions();

// Export auth options for admin users
export const adminAuthOptions: NextAuthOptions = createAdminAuthOptions();

// Re-export types for convenience
export { UserTypes } from "./auth/types";