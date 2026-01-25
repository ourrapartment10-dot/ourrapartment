import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

// PATCH: Update facility
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

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
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

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
