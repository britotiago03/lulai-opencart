// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    if (pathname.startsWith('/admin')) {
        if (pathname.includes('/api') || pathname.includes('/404')) {
            return NextResponse.next();
        }

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: 'admin-session-token'
        });

        // Debug cookies
        console.log('All cookies:', request.cookies.getAll());

        // Check token first
        if (!token?.adminAuthOrigin) {
            console.log('Missing adminAuthOrigin in token');
            return NextResponse.redirect(new URL('/404', request.url));
        }

        // Then check for admin cookie more flexibly
        const hasAdminCookie = request.cookies.getAll().some(
            cookie => cookie.name.includes('admin-auth')
        );

        if (!hasAdminCookie) {
            console.log('Admin cookie missing - setting new one');
            const response = NextResponse.next();
            response.cookies.set({
                name: 'admin-auth',
                value: 'true',
                path: '/admin',
                maxAge: 8 * 60 * 60,
                secure: true,
                sameSite: 'strict'
            });
            return response;
        }

        return NextResponse.next();
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};