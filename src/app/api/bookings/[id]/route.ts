import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

// PATCH: Approve/Reject/Cancel Booking
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId, role } = await requireAuth();

    const body = await req.json();
    const { status } = body; // APPROVED, REJECTED, CANCELLED

    if (!status) throw new ApiError(400, 'Status is required');

    const booking = await prisma.facilityBooking.findUnique({
      where: { id: params.id },
    });

    if (!booking) throw new ApiError(404, 'Booking not found');

    // Logic Check:
    // Admin can set any status
    // User can only CANCEL their own PENDING booking

    let isAuthorized = false;

    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      isAuthorized = true;
    } else if (booking.userId === userId && status === 'CANCELLED') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ApiError(403, 'Not authorized to modify this booking');
    }

    const updatedBooking = await prisma.facilityBooking.update({
      where: { id: params.id },
      data: { status },
    });

    // Trigger Notification to User if Admin changed status
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      // TODO: Send notification
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    return handleApiError(error);
  }
}
