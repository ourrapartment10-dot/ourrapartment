import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

import { UserRole } from '@/generated/client';

// GET: List all users
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

    // Verify role against DB directly to handle fresh updates cleanly
    const requester = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    if (!requester || requester.role !== (UserRole as any).SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin only' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update User Role
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    // Cast UserRole to any to avoid stale type errors in IDE if applicable
    if (!requester || requester.role !== (UserRole as any).SUPER_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    // Validation using Enum values
    if (!userId || !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Auto-approve if promoted to Admin or Super Admin
    const updateData: any = { role: role as UserRole };
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      updateData.status = 'APPROVED';
    }

    const updatedUser = await (prisma.user as any).update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
