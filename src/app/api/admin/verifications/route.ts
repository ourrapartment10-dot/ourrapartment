import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';
import { handleApiError, ApiError } from '@/lib/api-error';

const UserStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DEACTIVATED: 'DEACTIVATED',
} as any;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const requester = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    if (
      !requester ||
      (requester.role !== UserRole.ADMIN &&
        requester.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Forbidden');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const users = await (prisma.user as any).findMany({
      where: { status: status as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        image: true,
        property: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const requester = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, role: true },
    });

    if (
      !requester ||
      (requester.role !== UserRole.ADMIN &&
        requester.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Forbidden');
    }

    const body = await req.json();
    const { userId, action, rejectionReason } = body;

    if (!userId || !['APPROVE', 'REJECT'].includes(action)) {
      throw new ApiError(400, 'Invalid request body');
    }

    let updateData: any = {};

    if (action === 'APPROVE') {
      updateData = {
        status: UserStatus.APPROVED,
        role: UserRole.RESIDENT, // Auto-promote to resident on approval
        approvedById: requester.id,
      };
    } else if (action === 'REJECT') {
      updateData = {
        status: UserStatus.REJECTED,
        rejectionReason: rejectionReason || 'No specific reason provided',
      };
    }

    const updatedUser = await (prisma.user as any).update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: `User ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
