// app/api/admin/auth/session/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the session token
    const token = await getToken({
      req: new NextRequest('http://localhost', {
        headers: new Headers({
          'Content-Type': 'application/json',
          'Cookie': (await cookies())
            .getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ')
        })
      }),
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: token.id,
          email: token.email,
          isAdmin: token.isAdmin,
          adminAuthOrigin: token.adminAuthOrigin
        }
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    );
  }
}