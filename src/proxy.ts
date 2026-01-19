import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} from './lib/auth/token';

export async function proxy(request: NextRequest) {
  // 1. Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 2. Define protected paths
  const isProtectedPath =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/api/notifications');

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 3. Verify Access Token
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      return NextResponse.next();
    }
    // If payload is null, access token is expired/invalid. Fall through to refresh logic.
  }

  // 4. Try Refreshing
  if (refreshToken) {
    const payload = await verifyRefreshToken(refreshToken);

    if (payload && payload.userId) {
      // Valid refresh token! Generate new access token.
      const newAccessToken = await signAccessToken({
        userId: payload.userId,
        role: payload.role,
      });

      // Update request headers for downstream
      // This is key for route handlers using cookies() or headers()
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('cookie', `accessToken=${newAccessToken}`);

      // Create response to continue, with updated headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Also set the new access token in browser cookies
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      });

      return response;
    }
  }

  // 5. If we get here, neither token is valid.
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/notifications/:path*',
    '/api/admin/:path*',
  ],
};
