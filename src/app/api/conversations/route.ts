import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participantIds: {
                    has: payload.userId as string,
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                NOT: {
                                    readBy: {
                                        has: payload.userId as string
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
        });

        // Transform data to flatten _count
        const formattedConversations = conversations.map(c => ({
            ...c,
            unreadCount: c._count.messages
        }));

        return NextResponse.json(formattedConversations);
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { participantId } = await req.json();

        if (!participantId) {
            return new NextResponse('Participant ID is required', { status: 400 });
        }

        const currentUserId = payload.userId as string;

        // Check if conversation already exists
        // Note: This logic assumes 1:1 conversations.
        // We want to find a conversation where participantIds has exactly these two IDs.
        // Prisma doesn't support "exact match" on arrays easily in findFirst without complex logic or raw query on Mongo.
        // Simple workaround: findMany with 'has' both, then filter in JS (since conversation count per user is low-ish).
        // Or better: MongoDB query structure.

        // Attempt to find existing 1:1 conversation
        const existingConversations = await prisma.conversation.findMany({
            where: {
                AND: [
                    { participantIds: { has: currentUserId } },
                    { participantIds: { has: participantId } },
                ],
            },
        });

        const existingConversation = existingConversations.find(
            (c) => c.participantIds.length === 2 && c.participantIds.sort().join(',') === [currentUserId, participantId].sort().join(',')
        );

        if (existingConversation) {
            return NextResponse.json(existingConversation);
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                participantIds: [currentUserId, participantId],
                lastMessageAt: new Date(),
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Failed to create conversation:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
