import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    verifyAccessToken,
    verifyRefreshToken,
    signAccessToken,
} from './lib/auth/token';

export async function middleware(request: NextRequest) {
    // 1. Get tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // 2. Define protected paths
    const isProtectedPath =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/api/auth/');

    if (!isProtectedPath) {
        return NextResponse.next();
    }

    // 3. Verify Access Token
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
            // Valid access token - add user info to headers for API routes
            const response = NextResponse.next();
            response.headers.set('x-user-id', payload.userId as string);
            response.headers.set('x-user-role', payload.role as string);
            return response;
        }
        // If payload is null, access token is expired/invalid. Fall through to refresh logic.
    }

    // 4. Try Refreshing with Refresh Token
    if (refreshToken) {
        const payload = await verifyRefreshToken(refreshToken);

        if (payload && payload.userId) {
            // Valid refresh token! Generate new access token.
            const newAccessToken = await signAccessToken({
                userId: payload.userId,
                role: payload.role,
            });

            // Create response to continue
            const response = NextResponse.next();

            // Set the new access token in browser cookies
            response.cookies.set('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 15, // 15 minutes
            });

            // Add user info to headers for API routes
            response.headers.set('x-user-id', payload.userId as string);
            response.headers.set('x-user-role', payload.role as string);

            return response;
        }
    }

    // 5. If we get here, neither token is valid - redirect to login
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
        // Exclude auth routes from middleware
        '/((?!api/auth).*)',
    ],
};
