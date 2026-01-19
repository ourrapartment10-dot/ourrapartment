import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
    try {
        const config = await prisma.apartmentConfig.findFirst();
        return NextResponse.json(config || { maxProperties: 0, numberOfBlocks: 0, numberOfFloors: 0 });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { maxProperties, numberOfBlocks, numberOfFloors, blockNamingConvention, unitsPerFloor } = body;

        const config = await prisma.apartmentConfig.findFirst();

        let updatedConfig;
        if (config) {
            updatedConfig = await prisma.apartmentConfig.update({
                where: { id: config.id },
                data: {
                    maxProperties: parseInt(maxProperties),
                    numberOfBlocks: parseInt(numberOfBlocks),
                    numberOfFloors: parseInt(numberOfFloors),
                    unitsPerFloor: parseInt(unitsPerFloor),
                    blockNamingConvention: blockNamingConvention,
                },
            });
        } else {
            updatedConfig = await prisma.apartmentConfig.create({
                data: {
                    maxProperties: parseInt(maxProperties),
                    numberOfBlocks: parseInt(numberOfBlocks),
                    numberOfFloors: parseInt(numberOfFloors),
                    unitsPerFloor: parseInt(unitsPerFloor),
                    blockNamingConvention: blockNamingConvention,
                },
            });
        }

        return NextResponse.json(updatedConfig);
    } catch (error) {
        return handleApiError(error);
    }
}
