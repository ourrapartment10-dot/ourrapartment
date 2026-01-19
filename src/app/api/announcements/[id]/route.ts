import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole } from "@/generated/client";
import { deleteFromS3ByUrl } from "@/lib/s3-server";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        // Verify Admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can modify announcements");
        }

        const body = await req.json();
        const { commentsEnabled, isPinned } = body;

        const updateData: any = {};

        if (typeof commentsEnabled === 'boolean') {
            updateData.commentsEnabled = commentsEnabled;
        }

        if (typeof isPinned === 'boolean') {
            updateData.isPinned = isPinned;
            updateData.pinnedAt = isPinned ? new Date() : null;
        }

        const announcement = await prisma.announcement.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(announcement);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Edit announcement
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        // Verify Admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can edit announcements");
        }

        const body = await req.json();
        const { title, content, imageUrl, commentsEnabled, expiresAt } = body;

        const updateData: any = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (typeof commentsEnabled === 'boolean') updateData.commentsEnabled = commentsEnabled;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        const announcement = await prisma.announcement.update({
            where: { id: params.id },
            data: updateData,
            include: {
                author: {
                    select: { id: true, name: true, image: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });

        return NextResponse.json(announcement);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        // Verify Admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can delete announcements");
        }

        // Get the announcement to check if it has an image
        const announcement = await prisma.announcement.findUnique({
            where: { id: params.id },
            select: { imageUrl: true }
        });

        if (!announcement) {
            throw new ApiError(404, "Announcement not found");
        }

        // Delete image from S3 if it exists
        if (announcement.imageUrl) {
            await deleteFromS3ByUrl(announcement.imageUrl);
        }

        // Delete the announcement (cascade will delete related comments and likes)
        await prisma.announcement.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}
