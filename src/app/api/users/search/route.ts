import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (query === null) {
      // Allow empty query to fetch suggestions
    } else if (query.length === 0) {
      // Empty string query
    } else if (query.length < 1 && query.length > 0) {
      // Skip if strictly 0 < length < 1 which is impossible but logic hold
    }

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query || '', // Fallback to empty string which matches all if mode insensitive often, or just standard search
          mode: 'insensitive',
        },
        // Exclude system accounts or inactive if necessary
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('User search error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
