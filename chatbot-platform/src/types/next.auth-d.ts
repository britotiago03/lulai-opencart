// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

interface Subscription {
    plan_type: string;
    status: string;
    current_period_renewal: string;
}

declare module "next-auth" {
    interface Session {
        _user: {
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

    interface CookiesOptions {
        adminAuth: CookieOption;
    }
      
    interface CookieOption {
        name: string;
        options: {
          httpOnly: boolean;
          sameSite: 'lax' | 'strict' | 'none';
          path: string;
          secure: boolean;
          maxAge?: number;
        };
    }
}