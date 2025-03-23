// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";

interface Subscription {
    plan_type: string;
    status: string;
    current_period_end: string;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            subscription: Subscription | null;
            subscription_status: string | null;
            subscription_end_date: string | null;
            isAdmin?: boolean;
            isSuperAdmin?: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        subscription: Subscription | null;
        subscription_status?: string | null;
        subscription_end_date?: string | null;
        isAdmin?: boolean;
        isSuperAdmin?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        subscription: Subscription | null;
        subscription_status?: string | null;
        subscription_end_date?: string | null;
        isAdmin?: boolean;
        isSuperAdmin?: boolean;
    }
}

// Admin-specific types
export interface AdminUser {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    is_active: boolean;
    created_at: Date;
    last_login: Date | null;
}

export interface AdminAccessToken {
    id: number;
    url_path: string;
    access_key: string;
    created_at: Date;
    expires_at: Date;
    created_by: number;
    last_used_at: Date | null;
    is_active: boolean;
}

export interface AdminSettings {
    id: number;
    setting_key: string;
    setting_value: string;
    updated_at: Date;
    updated_by: number | null;
}