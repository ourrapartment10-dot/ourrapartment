import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/token';
import { loginSchema } from '@/lib/validations/auth';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.password) {
      // User exists but has no password (e.g. Google auth only)
      throw new ApiError(400, 'Please sign in with your social account');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new ApiError(401, 'Invalid credentials');
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

    // Store refresh token (hashed)
    // We need to hash it to match the logic in signup/refresh
    const tokenHash = await hashPassword(refreshToken);

    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Return response with cookies
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

    // Set HttpOnly cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
