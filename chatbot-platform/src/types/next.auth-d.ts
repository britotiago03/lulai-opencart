// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

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
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        subscription: Subscription | null;
    }
}