import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) throw new ApiError(401, 'Unauthorized');

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const where: any = { isActive: true };
        if (category && category !== 'All') {
            where.category = category;
        }

        const services = await prisma.serviceProvider.findMany({
            where,
            include: {
                addedBy: {
                    select: { name: true }
                },
                reviews: {
                    select: { rating: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating for each service
        const servicesWithRating = services.map(service => {
            const totalRating = service.reviews.reduce((acc, review) => acc + review.rating, 0);
            const avgRating = service.reviews.length > 0 ? totalRating / service.reviews.length : 0;
            return {
                ...service,
                averageRating: avgRating,
                reviewCount: service.reviews.length
            };
        });

        return NextResponse.json(servicesWithRating, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) throw new ApiError(401, 'Unauthorized');

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

        const body = await req.json();
        const { name, category, phone, description, price } = body;

        if (!name || !category || !phone) {
            throw new ApiError(400, 'Name, category, and phone are required');
        }

        const service = await prisma.serviceProvider.create({
            data: {
                name,
                category,
                phone,
                description,
                price,
                addedById: payload.userId as string,
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        return handleApiError(error);
    }
}
