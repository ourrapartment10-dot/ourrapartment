import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Updated to match Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) throw new ApiError(401, 'Unauthorized');

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

        const body = await req.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            throw new ApiError(400, 'Rating must be between 1 and 5');
        }

        // Upsert review (create or update)
        const review = await prisma.serviceReview.upsert({
            where: {
                serviceProviderId_userId: {
                    serviceProviderId: id,
                    userId: payload.userId as string,
                },
            },
            update: {
                rating,
                comment,
            },
            create: {
                serviceProviderId: id,
                userId: payload.userId as string,
                rating,
                comment,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        return handleApiError(error);
    }
}
