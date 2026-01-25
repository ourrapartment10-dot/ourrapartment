import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
// import { cookies } from 'next/headers';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        await requireAuth();

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
            },
        });

        if (!conversation) {
            return new NextResponse('Conversation not found', { status: 404 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Failed to fetch conversation:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
