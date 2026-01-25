import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
// import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN']);

    const [totalUsers, totalProperties, config] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.apartmentConfig.findFirst(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProperties,
      maxProperties: config?.maxProperties || 0,
      numberOfBlocks: config?.numberOfBlocks || 0,
      numberOfFloors: config?.numberOfFloors || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
