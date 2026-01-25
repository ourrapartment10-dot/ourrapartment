import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    const properties = await prisma.property.findMany({
      where: {
        user: {
          status: {
            not: 'REJECTED' as any,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    return handleApiError(error);
  }
}
