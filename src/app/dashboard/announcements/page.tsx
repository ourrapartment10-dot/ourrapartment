import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnnouncementFeed from '@/components/announcements/AnnouncementFeed';
import FeedHeader from '@/components/announcements/FeedHeader';

// Server Component
export default async function AnnouncementsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return redirect('/login');

  const payload = await verifyAccessToken(token);
  if (!payload || !payload.userId) return redirect('/login');

  const userId = payload.userId as string;

  // Fetch User for Role Check (needed for "Create" button visibility)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, image: true },
  });

  if (!user) return redirect('/login');

  // Fetch Initial Feed - OPTIMIZED
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    take: 10,
    orderBy: [
      { isPinned: 'desc' },
      { pinnedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
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

  // Fetch user's likes separately for better performance
  const userLikes = await prisma.announcementLike.findMany({
    where: {
      userId: userId,
      announcementId: { in: announcements.map(a => a.id) },
    },
    select: { announcementId: true },
  });

  const likedAnnouncementIds = new Set(userLikes.map(like => like.announcementId));

  // Process feed for basic stats
  const feed = announcements.map((post) => ({
    ...post,
    isLiked: likedAnnouncementIds.has(post.id),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));

  return (
    <div className="pb-20">
      <FeedHeader user={user} />
      <AnnouncementFeed initialPosts={feed} user={user} />
    </div>
  );
}
