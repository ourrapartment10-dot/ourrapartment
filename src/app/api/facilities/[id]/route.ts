import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

// PATCH: Update facility
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Only admins can update facilities');
    }

    const body = await req.json();

    // Don't allow updating ID
    delete body.id;

    const facility = await prisma.facility.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(facility);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Delete facility
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Only admins can delete facilities');
    }

    await prisma.facility.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Facility deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
