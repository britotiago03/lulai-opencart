import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

interface Subscription {
    plan_type: string;
    status: string;
    current_period_end: string;
}

interface Token {
    subscription?: Subscription | null;
}

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token as Token;

        // Check subscription for premium routes
        if (
            req.nextUrl.pathname.startsWith('/premium') &&
            (!token?.subscription || token.subscription.status !== 'active')
        ) {
            return NextResponse.redirect(new URL('/subscription', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/premium/:path*",
        "/api/protected/:path*",
    ],
};