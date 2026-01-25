import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
import { pusherServer } from '@/lib/pusher';
import { createAndSendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const messages = await prisma.message.findMany({
      where: {
        conversationId: null, // Only global messages
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const { content, replyToId } = await req.json();

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return new NextResponse('Message content is required', { status: 400 });
    }

    const senderId = userId;

    // 1. Create message in DB
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: null, // explicit
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

    // 2. Trigger Pusher Event
    await pusherServer.trigger('connect-space', 'new-message', message);

    // 3. Parse and Notify Mentions
    // Regex to find @Name
    // Note: Simple regex, assumes names are captured.
    // Better approach: Frontend sends mentioned user IDs, but we'll parse for simplicity OR use a regex for @Name
    // Since names can have spaces, this is tricky.
    // Convention: Mentions are formatted as @[Name](userId) or we just scan for @Name.
    // Let's assume frontend sends strictly formatted text or we just notify everyone for now?
    // No, prompted requirement: "mentions will be notified".
    // Let's rely on a robust way: Frontend usually sends list of mentioned userIds.
    // But if we must parse text:
    // We will look for patterns like @User Name

    // For simplicity in this iteration, let's assume we extract names or rely on generic "broadcast" if complex.
    // Actually, let's try to find users mentioned by name.

    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1); // remove @
        // Find user by name (first name match or full name)
        const mentionedUser = await prisma.user.findFirst({
          where: {
            name: {
              contains: username,
              mode: 'insensitive',
            },
          },
        });

        if (mentionedUser && mentionedUser.id !== senderId) {
          await createAndSendNotification(
            mentionedUser.id,
            'New Mention in Connect Space',
            `${message.sender.name} mentioned you: "${content.substring(0, 50)}..."`,
            'MENTION',
            '/dashboard/connect'
          );
        }
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
