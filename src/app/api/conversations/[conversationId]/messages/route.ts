import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
// import { cookies } from 'next/headers';
import { pusherServer } from '@/lib/pusher';

// Correctly type the params as a Promise
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;

        await requireAuth();

        // specific conversation messages
        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
            },
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(messages.reverse());
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;

        const { userId } = await requireAuth();

        const { content, replyToId } = await req.json();
        const senderId = userId;

        if (!content?.trim()) {
            return new NextResponse('Content required', { status: 400 });
        }

        // 1. Create message
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                conversationId: conversationId,
                readBy: [senderId],
                replyToId: replyToId || undefined,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        // 2. Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });

        // 3. Trigger Pusher
        await pusherServer.trigger(`conversation-${conversationId}`, 'new-message', message);

        return NextResponse.json(message);
    } catch (error) {
        console.error('Failed to send message:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
