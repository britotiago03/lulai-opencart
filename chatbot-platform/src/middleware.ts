// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';

// Define public paths
const PUBLIC_PATHS = ['/auth/(signin|signup)', '/api/public', '/404'];
const STATIC_PATHS = ['/_next', '/favicon.ico', '/images', '/assets'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public and static paths
  if (
    PUBLIC_PATHS.some(path => new RegExp(path).test(pathname)) ||
    STATIC_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.includes('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    return handleAdminRoutes(request);
  }

  // Handle all other protected routes
  return handleUserAuth(request);
}

async function handleAdminRoutes(request: NextRequest) {
  const adminCookie = request.cookies.get('admin-auth');
  const adminSession = request.cookies.get('admin-session-token');

  if (!adminSession || !adminCookie) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

async function handleUserAuth(request: NextRequest) {
  const userSession = request.cookies.get('user-session-token');

  if (!userSession) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ]
};