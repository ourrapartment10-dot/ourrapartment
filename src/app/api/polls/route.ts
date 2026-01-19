import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";
import { UserRole } from "@/generated/client";
import { pusherServer } from "@/lib/pusher";

// POST: Create Poll
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        const userId = payload.userId as string;

        // Verify Admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ApiError(403, "Only admins can create polls");
        }

        const body = await req.json();
        const { question, description, options, isAnonymous, endsAt, announcementId } = body;

        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            throw new ApiError(400, "Question and at least two options are required");
        }

        let poll;

        if (announcementId) {
            // Link to existing announcement
            poll = await prisma.poll.create({
                data: {
                    question,
                    description,
                    isAnonymous: isAnonymous ?? false,
                    endsAt: endsAt ? new Date(endsAt) : null,
                    createdById: userId,
                    announcementId: announcementId,
                    options: {
                        create: options.map((opt: string) => ({ text: opt }))
                    }
                },
                include: {
                    options: { include: { _count: { select: { votes: true } } } },
                    announcement: {
                        include: {
                            author: { select: { id: true, name: true, image: true, role: true } },
                            likes: true,
                            comments: true
                        }
                    }
                }
            });
        } else {
            // Standalone: Create announcement and poll together atomically
            const announcement = await prisma.announcement.create({
                data: {
                    title: question,
                    content: description || "Community Opinion Poll",
                    authorId: userId,
                    commentsEnabled: true,
                    expiresAt: null, // Explicitly set to null for feed filtering
                    poll: {
                        create: {
                            question,
                            description,
                            isAnonymous: isAnonymous ?? false,
                            endsAt: endsAt ? new Date(endsAt) : null,
                            createdById: userId,
                            options: {
                                create: options.map((opt: string) => ({ text: opt }))
                            }
                        }
                    }
                },
                include: {
                    author: { select: { id: true, name: true, image: true, role: true } },
                    likes: true,
                    comments: true,
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: { select: { votes: true } }
                                }
                            }
                        }
                    }
                }
            });

            // Format for Pusher/Response
            poll = {
                ...announcement.poll,
                announcement: {
                    ...announcement,
                    poll: undefined // Avoid circularity
                }
            };

            // Trigger real-time update
            const formattedPost = {
                ...announcement,
                isLiked: false,
                likeCount: 0,
                commentCount: 0,
                comments: [],
                likes: []
            };
            await pusherServer.trigger("announcements", "new-post", formattedPost);
        }

        return NextResponse.json(poll);
    } catch (error) {
        return handleApiError(error);
    }
}
