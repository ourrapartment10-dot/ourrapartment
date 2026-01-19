import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole } from "@/generated/client";

// GET: Fetch all facilities
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        let isAdmin = false;

        if (token) {
            const payload = await verifyAccessToken(token);
            if (payload && (payload.role === UserRole.ADMIN || payload.role === UserRole.SUPER_ADMIN)) {
                isAdmin = true;
            }
        }

        const facilities = await prisma.facility.findMany({
            where: isAdmin ? {} : { isActive: true },
            include: {
                bookings: {
                    where: {
                        status: { in: ['APPROVED', 'PENDING'] },
                        endTime: { gte: new Date() }
                    },
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        status: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(facilities);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create a new facility
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can create facilities");
        }

        const body = await req.json();
        const { name, description, capacity, hourlyRate, amenities, rules, images } = body;

        if (!name) {
            throw new ApiError(400, "Facility name is required");
        }

        const facility = await prisma.facility.create({
            data: {
                name,
                description,
                capacity: capacity ? parseInt(capacity) : null,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                amenities: amenities || [],
                rules,
                images: images || []
            }
        });

        return NextResponse.json(facility, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
