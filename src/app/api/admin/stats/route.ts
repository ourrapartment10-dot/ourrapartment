import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const payload = await verifyAccessToken(token);
        if (!payload || payload.role !== "SUPER_ADMIN") {
            throw new ApiError(403, "Forbidden: Super Admin access required");
        }

        const [totalUsers, totalProperties, config] = await Promise.all([
            prisma.user.count(),
            prisma.property.count(),
            prisma.apartmentConfig.findFirst()
        ]);

        return NextResponse.json({
            totalUsers,
            totalProperties,
            maxProperties: config?.maxProperties || 0,
            numberOfBlocks: config?.numberOfBlocks || 0,
            numberOfFloors: config?.numberOfFloors || 0
        });
    } catch (error) {
        return handleApiError(error);
    }
}
