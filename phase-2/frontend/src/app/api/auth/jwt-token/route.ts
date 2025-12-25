import { auth } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to get JWT token from Better Auth session
 * This endpoint generates a JWT token for the current authenticated session
 * The token is generated using the same secret and format as Better Auth JWT plugin
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth
    // Better Auth's getSession needs the full request context
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate JWT token for the authenticated user
    // This matches what Better Auth JWT plugin does internally
    const { SignJWT } = await import('jose');
    const secret = process.env.BETTER_AUTH_SECRET;
    
    if (!secret) {
      console.error('BETTER_AUTH_SECRET is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate JWT with same structure as Better Auth JWT plugin
    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT({
      sub: session.user.id, // User ID as subject (standard JWT claim)
      email: session.user.email || '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days expiration (matches Better Auth default)
      .sign(secretKey);
    
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Error in JWT token endpoint:', error);
    
    // If it's an authentication error, return 401
    if (error.message?.includes('Not authenticated') || error.status === 401) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get JWT token', details: error.message },
      { status: 500 }
    );
  }
}

