import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

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
