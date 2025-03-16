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
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        subscription: Subscription | null;
        subscription_status?: string | null;
        subscription_end_date?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        subscription: Subscription | null;
        subscription_status?: string | null;
        subscription_end_date?: string | null;
    }
}