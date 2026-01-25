import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, getAuthUser } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

// GET: Fetch all facilities
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    let isAdmin = false;

    if (auth && (auth.role === UserRole.ADMIN || auth.role === UserRole.SUPER_ADMIN)) {
      isAdmin = true;
    }

    const facilities = await prisma.facility.findMany({
      where: isAdmin ? {} : { isActive: true },
      include: {
        bookings: {
          where: {
            status: { in: ['APPROVED', 'PENDING'] },
            endTime: { gte: new Date() },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(facilities, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new facility
export async function POST(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    const body = await req.json();
    const {
      name,
      description,
      capacity,
      hourlyRate,
      amenities,
      rules,
      images,
    } = body;

    if (!name) {
      throw new ApiError(400, 'Facility name is required');
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        description,
        capacity: capacity ? parseInt(capacity) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        amenities: amenities || [],
        rules,
        images: images || [],
      },
    });

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
