import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { pusherServer } from "@/lib/pusher";
import { sendPushNotification } from "@/lib/push";

// POST: Add Comment
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        const userId = payload.userId as string;
        const announcementId = params.id;
        const body = await req.json();
        const { content, mentionedUserIds = [] } = body;

        if (!content) throw new ApiError(400, "Comment content is required");

        console.log('Comment content:', content);
        console.log('Mentioned user IDs:', mentionedUserIds);

        // Check if comments disabled
        const post = await prisma.announcement.findUnique({
            where: { id: announcementId },
            select: {
                commentsEnabled: true,
                title: true,
                authorId: true
            }
        });

        if (!post) throw new ApiError(404, "Announcement not found");

        if (!post.commentsEnabled) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
                throw new ApiError(403, "Comments are disabled for this post");
            }
        }

        // Get commenter info
        const commenter = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        const comment = await prisma.announcementComment.create({
            data: {
                content,
                announcementId,
                userId
            },
            include: {
                user: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        // Handle mentions if any user IDs were provided
        if (mentionedUserIds.length > 0) {
            console.log('Processing mentions for user IDs:', mentionedUserIds);

            // Get mentioned users (excluding the commenter)
            const mentionedUsers = await prisma.user.findMany({
                where: {
                    AND: [
                        {
                            id: {
                                in: mentionedUserIds
                            }
                        },
                        {
                            id: {
                                not: userId // Don't notify the commenter
                            }
                        }
                    ]
                },
                select: { id: true, name: true }
            });

            console.log('Found mentioned users:', mentionedUsers);

            if (mentionedUsers.length > 0) {
                // Create notifications for mentioned users
                const notifications = mentionedUsers.map(user => ({
                    userId: user.id,
                    type: "MENTION" as const,
                    title: "You were mentioned",
                    message: `${commenter?.name} mentioned you in a comment on "${post.title}"`,
                    link: `/dashboard/announcements`,
                    read: false
                }));

                await prisma.notification.createMany({
                    data: notifications
                });

                console.log('Created notifications for:', mentionedUsers.map(u => u.name));

                // Send push notifications via Pusher
                for (const user of mentionedUsers) {
                    // Send real-time notification via Pusher
                    await pusherServer.trigger(`user-${user.id}`, "notification", {
                        type: "MENTION",
                        title: "You were mentioned",
                        message: `${commenter?.name} mentioned you in a comment`,
                        link: `/dashboard/announcements`
                    });
                    console.log(`Sent Pusher notification to user ${user.id} (${user.name})`);

                    // Send browser push notification
                    await sendPushNotification(
                        user.id,
                        "You were mentioned",
                        `${commenter?.name} mentioned you in a comment on "${post.title}"`,
                        `/dashboard/announcements`
                    );
                    console.log(`Sent browser push notification to user ${user.id} (${user.name})`);
                }
            } else {
                console.log('No valid mentioned users found (might be self-mention)');
            }
        }

        // Trigger Pusher event for new comment
        await pusherServer.trigger(`announcement-${announcementId}`, "new-comment", comment);

        return NextResponse.json(comment);
    } catch (error) {
        return handleApiError(error);
    }
}
