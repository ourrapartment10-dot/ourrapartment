import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { UserRole } from '@/generated/client';
import { handleApiError, ApiError } from '@/lib/api-error';

const UserStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DEACTIVATED: 'DEACTIVATED',
} as any;

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

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
    const requester = await requireRole(['ADMIN', 'SUPER_ADMIN']);

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
        approvedById: requester.userId,
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
