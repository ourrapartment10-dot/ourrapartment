import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to list all users comfortably?
    // Or residents might need to search others?
    // For payments, it's admins listing residents.
    // We'll proceed with basic fetch.

    const users = await prisma.user.findMany({
      where: {
        status: 'APPROVED', // Only approved users
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        property: {
          select: {
            block: true,
            flatNumber: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Map flatNumber to unitNumber for frontend consistency
    const mappedUsers = users.map((u) => ({
      ...u,
      property: u.property
        ? {
            ...u.property,
            unitNumber: u.property.flatNumber,
          }
        : null,
    }));

    return NextResponse.json({ users: mappedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
