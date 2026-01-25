import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth/token';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { handleApiError, ApiError } from '@/lib/api-error';

import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get('refreshToken')?.value;

    // Fallback to body for potential non-browser clients
    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch (e) {
        // Ignore if no body
      }
    }

    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    // 1. Verify JWT signature/expiry
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // 2. Get all active tokens for user and verify match
    const savedTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId as string,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    const matchingToken = await findMatchingToken(refreshToken, savedTokens);

    if (!matchingToken) {
      throw new ApiError(401, 'Invalid or revoked refresh token');
    }

    // 3. Output Rotation: Revoke the used token
    await prisma.refreshToken.update({
      where: { id: matchingToken.id },
      data: { revoked: true },
    });

    // 4. Issue new pair
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user) throw new ApiError(401, 'User not found');

    const newAccessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    });
    const newRefreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // Store new refresh token
    const newTokenHash = await hashPassword(newRefreshToken);
    await prisma.refreshToken.create({
      data: {
        token: newTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // 5. Set Cookies for Browser Clients
    const response = NextResponse.json({
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        status: (user as any).status,
        image: (user as any).image,
      },
    });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

async function findMatchingToken(plainToken: string, tokens: any[]) {
  for (const t of tokens) {
    const isValid = await comparePassword(plainToken, t.token);
    if (isValid) return t;
  }
  return null;
}
