// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Debug logging
    console.log(`Middleware running for path: ${path}`);

    // Only process admin paths
    if (!path.startsWith('/admin')) {
        console.log('Not an admin path, skipping middleware');
        return NextResponse.next();
    }

    // Get URL parameters for token validation
    const url = new URL(request.url);
    const setupToken = url.searchParams.get('token');
    const fromSetup = url.searchParams.get('from') === 'setup';

    console.log('URL params:', {
        path,
        hasSetupToken: !!setupToken,
        fromSetup
    });

    // Special handling for /admin/setup with token parameter
    if (path === '/admin/setup' && setupToken) {
        console.log('Access granted: Setup page with token');
        return NextResponse.next();
    }

    // Allow access to signin if coming from setup
    if (path === '/admin/signin' && fromSetup) {
        console.log('Access granted: Signin page from setup');
        return NextResponse.next();
    }

    // For all other admin routes, check for admin authentication
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('Authentication token:', {
        hasToken: !!token,
        tokenRole: token?.role || 'none',
        isAdmin: token?.role === 'admin'
    });

    // If authenticated as admin, allow access
    if (token && token.role === 'admin') {
        console.log('Access granted: Authenticated admin user');
        return NextResponse.next();
    }

    // Otherwise, show 404 to hide the existence of the admin area
    console.log('Access denied: Redirecting to 404');
    return NextResponse.redirect(new URL('/404', request.url));
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all admin routes
        '/admin/:path*',
    ],
};