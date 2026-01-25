import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole, UserStatus } from '@/generated/client';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    // Fetch all Residents and Admins (Exclude SUPER_ADMIN) where status is APPROVED
    const residents = await prisma.user.findMany({
      where: {
        status: UserStatus.APPROVED,
        role: {
          in: [UserRole.RESIDENT, UserRole.ADMIN],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        image: true,
        createdAt: true,
        property: {
          select: {
            block: true,
            floor: true,
            flatNumber: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(residents);
  } catch (error) {
    return handleApiError(error);
  }
}
