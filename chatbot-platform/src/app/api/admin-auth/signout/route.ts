// app/api/admin-auth/signout/route.ts
import { NextResponse } from 'next/server';

/**
 * Handler for admin signout API requests
 * This is a custom endpoint to ensure admin sessions are completely terminated
 */
export async function POST() {
    try {
        // List of cookies to remove
        const cookieNames = [
            'admin-session-token',
            'admin-session',
            'next-auth.admin-session-token',
            'next-auth.csrf-token',
            'next-auth.callback-url',
            'next-auth.state'
        ];

        // Delete all admin-related cookies by setting response headers
        // Create a response with headers that will clear the cookies
        const response = NextResponse.json({
            success: true,
            message: 'Admin session terminated successfully'
        });

        // Add Set-Cookie headers to clear each cookie
        cookieNames.forEach(name => {
            // Add expired Set-Cookie headers for each path we want to clear
            ["/", "/admin", "/api", "/api/admin-auth"].forEach(path => {
                response.headers.append(
                    'Set-Cookie',
                    `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax`
                );
            });
        });

        return response;
    } catch (error) {
        console.error('Error in admin signout:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to terminate admin session' },
            { status: 500 }
        );
    }
}