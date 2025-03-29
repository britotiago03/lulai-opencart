// app/api/auth/check-subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { userAuthOptions } from '@/lib/auth-config';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(userAuthOptions);
  const url = new URL(request.url);
  
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth/signin', url.origin));
  }

  try {
    const result = await pool.query(
      'SELECT subscription_status FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const subscriptionStatus = result.rows[0]?.subscription_status || 'none';
    
    if (subscriptionStatus === 'none') {
      return NextResponse.redirect(new URL('/subscriptions', url.origin));
    } else {
      return NextResponse.redirect(new URL('/dashboard', url.origin));
    }
  } catch (error) {
    console.error('Subscription check failed:', error);
    return NextResponse.redirect(new URL('/home', url.origin));
  }
}

export async function POST(request: Request) {
  // Google OAuth might use POST, so we'll handle it the same way
  return GET(request);
}