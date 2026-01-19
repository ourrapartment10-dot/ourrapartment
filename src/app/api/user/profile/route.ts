import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { ApiError, handleApiError } from '@/lib/api-error';

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      throw new ApiError(401, 'Unauthorized');
    }

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      throw new ApiError(401, 'Invalid token');
    }

    const body = await req.json();
    const { name, phone, image, notificationsEnabled } = body;

    // Validation
    if (!name) {
      throw new ApiError(400, 'Name is required');
    }

    // Check phone uniqueness if provided
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: payload.userId as string },
        },
      });

      if (existingPhone) {
        throw new ApiError(
          409,
          'Phone number already in use by another account'
        );
      }
    }

    const dataToUpdate: any = {
      name,
      phone,
      image,
    };

    if (notificationsEnabled !== undefined) {
      dataToUpdate.notificationsEnabled = notificationsEnabled;
    }

    const updatedUser = await (prisma.user as any).update({
      where: { id: payload.userId as string },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        phone: true,
        notificationsEnabled: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
