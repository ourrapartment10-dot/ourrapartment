import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId, role } = await requireAuth();

        // Get the service provider to check ownership
        const service = await prisma.serviceProvider.findUnique({
            where: { id },
        });

        if (!service) throw new ApiError(404, 'Service provider not found');

        // Allow Admin, Super Admin, or the user who created it
        const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
        const isOwner = service.addedById === userId;

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
        const { userId, role } = await requireAuth();

        const body = await req.json();
        const { name, category, phone, description, price } = body;

        // Get the service provider to check ownership
        const service = await prisma.serviceProvider.findUnique({
            where: { id },
        });

        if (!service) throw new ApiError(404, 'Service provider not found');

        // Allow Admin, Super Admin, or the user who created it
        const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
        const isOwner = service.addedById === userId;

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
