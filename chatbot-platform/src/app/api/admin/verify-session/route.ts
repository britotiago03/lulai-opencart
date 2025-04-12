// app/api/admin/verify-session/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
    const token = await getToken({ req: new NextRequest(request.url) });
    
    if (!token?.adminAuthOrigin) {
        return NextResponse.json(
            { verified: false, error: 'Invalid admin session' },
            { status: 403 }
        );
    }

    return NextResponse.json({ verified: true });
}