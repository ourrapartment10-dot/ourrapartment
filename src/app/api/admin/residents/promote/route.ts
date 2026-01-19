import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

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

    // Only ADMIN and SUPER_ADMIN can promote
    if (
      !requester ||
      (requester.role !== UserRole.ADMIN &&
        requester.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Forbidden');
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true },
    });

    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    if (targetUser.role !== UserRole.RESIDENT) {
      throw new ApiError(
        400,
        'Only Residents can be promoted to Admin. Admins cannot be modified.'
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `${updatedUser.name} has been successfully promoted to Admin.`,
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
