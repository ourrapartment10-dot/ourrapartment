import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole } from "@/generated/client";

// GET: Single Poll
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const poll = await prisma.poll.findUnique({
            where: { id: params.id },
            include: {
                options: {
                    include: {
                        _count: { select: { votes: true } }
                    }
                }
            }
        });

        if (!poll) throw new ApiError(404, "Poll not found");

        return NextResponse.json(poll);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Update Poll
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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
            throw new ApiError(403, "Only admins can edit polls");
        }

        const body = await req.json();
        const { question, description, endsAt, isAnonymous } = body;

        const poll = await prisma.poll.update({
            where: { id: params.id },
            data: {
                question,
                description,
                endsAt: endsAt ? new Date(endsAt) : null,
                isAnonymous
            },
            include: { options: true }
        });

        return NextResponse.json(poll);
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE: Poll
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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
            throw new ApiError(403, "Only admins can delete polls");
        }

        await prisma.poll.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: "Poll deleted" });
    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH: Toggle Pin
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
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can pin polls");
        }

        const body = await req.json();
        const { isPinned } = body;

        const poll = await prisma.poll.update({
            where: { id: params.id },
            data: {
                isPinned,
                pinnedAt: isPinned ? new Date() : null
            }
        });

        // Also update the associated announcement if it exists to bring it to top of feed
        if (poll.announcementId) {
            await prisma.announcement.update({
                where: { id: poll.announcementId },
                data: {
                    isPinned,
                    pinnedAt: isPinned ? new Date() : null
                }
            });
        }

        return NextResponse.json(poll);
    } catch (error) {
        return handleApiError(error);
    }
}
