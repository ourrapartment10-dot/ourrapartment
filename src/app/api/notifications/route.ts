import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { ApiError, handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

// GET /api/notifications - Get user notifications
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      console.error(
        'Notifications API: Token verification failed for token:',
        token.substring(0, 10) + '...'
      );
      throw new ApiError(401, 'Invalid token');
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: {
        userId: payload.userId as string,
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) throw new ApiError(401, 'Unauthorized');
    const payload = await verifyAccessToken(token);
    if (!payload) throw new ApiError(401, 'Invalid token');

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: payload.userId as string, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: payload.userId as string },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
