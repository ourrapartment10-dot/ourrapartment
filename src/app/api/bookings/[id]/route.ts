import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole } from "@/generated/client";

// PATCH: Approve/Reject/Cancel Booking
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true, id: true }
        });

        if (!user) throw new ApiError(401, "User not found");

        const body = await req.json();
        const { status } = body; // APPROVED, REJECTED, CANCELLED

        if (!status) throw new ApiError(400, "Status is required");

        const booking = await prisma.facilityBooking.findUnique({
            where: { id: params.id }
        });

        if (!booking) throw new ApiError(404, "Booking not found");

        // Logic Check:
        // Admin can set any status
        // User can only CANCEL their own PENDING booking

        let isAuthorized = false;

        if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
            isAuthorized = true;
        } else if (booking.userId === user.id && status === 'CANCELLED') {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            throw new ApiError(403, "Not authorized to modify this booking");
        }

        const updatedBooking = await prisma.facilityBooking.update({
            where: { id: params.id },
            data: { status }
        });

        // Trigger Notification to User if Admin changed status
        if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
            // TODO: Send notification
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        return handleApiError(error);
    }
}
