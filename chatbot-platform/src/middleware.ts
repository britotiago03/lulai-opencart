// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Only process admin paths
    if (!path.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Get the setup token from the URL if it exists
    const url = new URL(request.url);
    const setupToken = url.searchParams.get('token');

    // Handle the setup page - only accessible with a valid token parameter
    if (path.startsWith('/admin/setup')) {
        // Allow access if there's a token parameter (we'll validate it in the page)
        if (setupToken) {
            return NextResponse.next();
        }
        // If someone tries to access /admin/setup without a token, show 404
        return NextResponse.redirect(new URL('/404', request.url));
    }

    // Handle the signin page - only accessible for returning admins with valid session
    // or if it's a callback from the setup process
    if (path.startsWith('/admin/signin')) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        const fromSetup = url.searchParams.get('from') === 'setup';

        // Allow access if user is an admin, or coming from setup
        if ((token && token.role === 'admin') || fromSetup) {
            return NextResponse.next();
        }
        // Otherwise show 404
        return NextResponse.redirect(new URL('/404', request.url));
    }

    // For all other admin paths, require admin authentication
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token or the user is not an admin, show 404
    if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/404', request.url));
    }

    // Allow access if the user is authenticated and is an admin
    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all admin routes
        '/admin/:path*',
    ],
};