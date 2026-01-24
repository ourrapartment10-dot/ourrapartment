import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { UserRole } from '@/generated/client';
import { pusherServer } from '@/lib/pusher';
import { sendPushNotification } from '@/lib/push';

// GET: Fetch feed
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const userId = payload.userId as string;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      skip,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        { pinnedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        likes: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
              },
            },
            votes: {
              where: { userId: userId },
              select: { userId: true, optionId: true },
            },
          },
        },
      },
    });

    const total = await prisma.announcement.count({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    // Transform data to include user interactions
    const feed = announcements.map((post) => ({
      ...post,
      isLiked: post.likes.some((like) => like.userId === userId),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
    }));

    return NextResponse.json({
      data: feed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create announcement
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    // Verify Admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true, name: true },
    });

    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new ApiError(403, 'Only admins can post announcements');
    }

    const body = await req.json();
    const {
      title,
      content,
      imageUrl,
      commentsEnabled,
      expiresAt,
      poll: pollData,
    } = body;

    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required');
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl,
        commentsEnabled: commentsEnabled ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        authorId: payload.userId as string,
        poll: pollData
          ? {
            create: {
              question: pollData.question,
              description: pollData.description,
              isAnonymous: pollData.isAnonymous ?? false,
              endsAt: pollData.endsAt ? new Date(pollData.endsAt) : null,
              createdById: payload.userId as string,
              options: {
                create: pollData.options.map((opt: string) => ({
                  text: opt,
                })),
              },
            },
          }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        likes: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
              },
            },
            votes: true,
          },
        },
      },
    });

    // 1. Trigger Websocket Event
    await pusherServer.trigger('announcements', 'new-post', {
      ...announcement,
      isLiked: false,
      likeCount: 0,
      commentCount: 0,
    });

    // 2. Send Push Notifications (async, don't await blocking)
    // Fetch all users with valid subscriptions
    // We'll filter this logically or just broadcast if we have a robust push system.
    // For now, simpler implementation:

    // This part would ideally be a background job.
    // We will query users and send notifications.
    const recipients = await prisma.user.findMany({
      where: {
        notificationsEnabled: true,
        status: 'APPROVED',
      },
      select: { id: true },
    });

    // Use Promise.allSettled for batch sending
    // Actually sendPushNotification takes a userId.
    // We should just loop. For large scale, use a queue.
    recipients.forEach((recipient) => {
      if (recipient.id !== payload.userId) {
        // Don't notify self? Optional.
        sendPushNotification(
          recipient.id,
          `📢 ${title}`,
          content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          '/dashboard/announcements'
        ).catch(console.error);
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}
