import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';

// GET: Single Poll
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!poll) throw new ApiError(404, 'Poll not found');

    return NextResponse.json(poll);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT: Update Poll
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    const body = await req.json();
    const { question, description, endsAt, isAnonymous } = body;

    const poll = await prisma.poll.update({
      where: { id: params.id },
      data: {
        question,
        description,
        endsAt: endsAt ? new Date(endsAt) : null,
        isAnonymous,
      },
      include: { options: true },
    });

    return NextResponse.json(poll);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Poll
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    await prisma.poll.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Poll deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH: Toggle Pin
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);

    const body = await req.json();
    const { isPinned } = body;

    const poll = await prisma.poll.update({
      where: { id: params.id },
      data: {
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
      },
    });

    // Also update the associated announcement if it exists to bring it to top of feed
    if (poll.announcementId) {
      await prisma.announcement.update({
        where: { id: poll.announcementId },
        data: {
          isPinned,
          pinnedAt: isPinned ? new Date() : null,
        },
      });
    }

    return NextResponse.json(poll);
  } catch (error) {
    return handleApiError(error);
  }
}
