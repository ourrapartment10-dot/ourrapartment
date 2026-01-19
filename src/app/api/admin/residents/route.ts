import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole, UserStatus } from "@/generated/client";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            throw new ApiError(401, "Unauthorized");
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Forbidden: Admin access required");
        }

        // Fetch all Residents and Admins (Exclude SUPER_ADMIN) where status is APPROVED
        const residents = await prisma.user.findMany({
            where: {
                status: UserStatus.APPROVED,
                role: {
                    in: [UserRole.RESIDENT, UserRole.ADMIN]
                }
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
                        flatNumber: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(residents);
    } catch (error) {
        return handleApiError(error);
    }
}
