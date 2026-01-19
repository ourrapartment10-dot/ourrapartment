import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { pusherServer } from '@/lib/pusher';

// POST: Toggle Like
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const userId = payload.userId as string;
    const announcementId = params.id;

    // Check if already liked
    const existingLike = await prisma.announcementLike.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Unliking
      await prisma.announcementLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      // Liking
      await prisma.announcementLike.create({
        data: {
          announcementId,
          userId,
        },
      });
      isLiked = true;
    }

    // Get updated count
    const likeCount = await prisma.announcementLike.count({
      where: { announcementId },
    });

    // Trigger Pusher update
    await pusherServer.trigger(
      `announcement-${announcementId}`,
      'stats-update',
      {
        likeCount,
        // We can't trigger 'isLiked' globally because it's user specific
        // But we can trigger the count update
      }
    );

    return NextResponse.json({ isLiked, likeCount });
  } catch (error) {
    return handleApiError(error);
  }
}
