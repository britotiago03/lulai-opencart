import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminAuthOptions } from "@/lib/auth-config";

export async function GET() {
    try {
        // Get admin session for debugging
        const session = await getServerSession(adminAuthOptions);
        
        return NextResponse.json({
            hasSession: !!session,
            user: session?.user || null,
            isAdmin: session?.user?.role === "admin",
            sessionData: session
        });
        
    } catch (error) {
        console.error('Error debugging admin session:', error);
        return NextResponse.json(
            { error: 'Failed to debug session' },
            { status: 500 }
        );
    }
}