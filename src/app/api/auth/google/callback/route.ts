import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/auth/token';
import { hashPassword } from '@/lib/auth/password';

import { UserRole } from '@/generated/client';

async function getGoogleUser(code: string, redirectUri: string) {
  const tokenParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const tokens = await tokenResponse.json();
  const accessToken = tokens.access_token;

  const profileResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!profileResponse.ok) {
    throw new Error('Failed to get user profile');
  }

  return profileResponse.json();
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    const origin = req.nextUrl.origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

    const googleUser = await getGoogleUser(code, redirectUri);
    const { email, name, picture, id: googleId } = googleUser;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { property: true },
    });

    if (!user) {
      // Create user
      // NOTE: We don't have phone number yet. The schema says `phone` is optional?
      // Wait, in my schema I made `phone String? @unique` but comment said "Required for profile completion".
      // Correct. So we create user efficiently.

      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture,
          provider: 'GOOGLE',
          role: UserRole.USER,
          // phone is intentionally null
        },
        include: { property: true },
      });
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // Store refresh token
    const tokenHash = await hashPassword(refreshToken);
    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Check if profile is complete (phone number and property)
    if (!user.phone || !user.property) {
      // Redirect to complete-profile with temporary token
      // We can pass the tokens via URL or set them in cookies.
      // Ideally, set cookies.
      const response = NextResponse.redirect(
        new URL('/complete-profile', req.url)
      );
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15, // 15 minutes
      });
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    // Fully authenticated
    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }
}
