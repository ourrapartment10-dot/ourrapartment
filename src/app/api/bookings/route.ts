import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';
import { sendPushNotification } from '@/lib/push';

// GET: Fetch bookings
export async function GET(req: NextRequest) {
  try {
    const { userId, role } = await requireAuth();

    const url = new URL(req.url);
    const facilityId = url.searchParams.get('facilityId');
    const status = url.searchParams.get('status');

    let whereClause: any = {};

    // Residents only see their own bookings unless filtering for availability check (public data usually limited)
    // But the requirement says "Residents can see them and book them".
    // Usually, residents can see *that* a slot is booked, but maybe not by *whom*.
    // For My Bookings tab:
    if (role === UserRole.USER || role === UserRole.RESIDENT) {
      whereClause.userId = userId;
    }

    if (facilityId) whereClause.facilityId = facilityId;
    if (status) whereClause.status = status;

    const bookings = await prisma.facilityBooking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            image: true,
            property: {
              select: {
                flatNumber: true,
              },
            },
          },
        },
        facility: {
          select: { name: true, hourlyRate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create booking
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await req.json();
    const { facilityId, startTime, endTime, purpose, notes } = body;

    if (!facilityId || !startTime || !endTime) {
      throw new ApiError(400, 'Missing required fields');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      throw new ApiError(400, 'Cannot book in the past');
    }

    if (start >= end) {
      throw new ApiError(400, 'End time must be after start time');
    }

    // Check for conflicts
    const overlappingBooking = await prisma.facilityBooking.findFirst({
      where: {
        facilityId,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          {
            AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
          },
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
          },
          {
            AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ApiError(409, 'Selected time slot is already booked');
    }

    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) throw new ApiError(404, 'Facility not found');

    // Calculate Cost
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalCost = facility.hourlyRate
      ? facility.hourlyRate * durationHours
      : 0;

    const booking = await prisma.facilityBooking.create({
      data: {
        userId: userId,
        facilityId,
        startTime: start,
        endTime: end,
        purpose,
        notes,
        totalCost,
        status: 'PENDING',
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: {
        role: UserRole.ADMIN,
        status: 'APPROVED',
      },
      select: { id: true },
    });

    // Current User Name (for the message)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const notificationPromises = admins.map(async (admin) => {
      const title = 'New Facility Booking';
      const message = `${currentUser?.name || 'A resident'} requested ${facility.name} on ${start.toLocaleDateString()}`;
      const link = '/dashboard/facilities?tab=reservations';

      // 1. Create In-App Notification
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title,
          message,
          type: 'FACILITY_BOOKING',
          link,
          read: false,
        },
      });

      // 2. Send Push Notification
      await sendPushNotification(admin.id, title, message, link).catch(
        (err: any) => console.error(`Failed to push to ${admin.id}`, err)
      );
    });

    // Execute notifications without blocking the response significantly
    // In a real production app, this should be offloaded to a queue
    await Promise.allSettled(notificationPromises);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
