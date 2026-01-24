import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) throw new ApiError(401, 'Unauthorized');

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

        // Get the requester role
        const requester = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, role: true },
        });

        if (!requester) throw new ApiError(401, 'User not found');

        // Get the service provider to check ownership
        const service = await prisma.serviceProvider.findUnique({
            where: { id },
        });

        if (!service) throw new ApiError(404, 'Service provider not found');

        // Allow Admin, Super Admin, or the user who created it
        const isAdmin = requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN;
        const isOwner = service.addedById === requester.id;

        if (!isAdmin && !isOwner) {
            throw new ApiError(403, 'You do not have permission to delete this service');
        }

        await prisma.serviceProvider.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Service provider deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) throw new ApiError(401, 'Unauthorized');

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

        const body = await req.json();
        const { name, category, phone, description, price } = body;

        // Get the requester role
        const requester = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, role: true },
        });

        if (!requester) throw new ApiError(401, 'User not found');

        // Get the service provider to check ownership
        const service = await prisma.serviceProvider.findUnique({
            where: { id },
        });

        if (!service) throw new ApiError(404, 'Service provider not found');

        // Allow Admin, Super Admin, or the user who created it
        const isAdmin = requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN;
        const isOwner = service.addedById === requester.id;

        if (!isAdmin && !isOwner) {
            throw new ApiError(403, 'You do not have permission to edit this service');
        }

        const updatedService = await prisma.serviceProvider.update({
            where: { id },
            data: {
                name,
                category,
                phone,
                description,
                price,
            },
        });

        return NextResponse.json(updatedService);
    } catch (error) {
        return handleApiError(error);
    }
}
