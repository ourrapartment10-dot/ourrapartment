import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function POST(
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

        const userId = payload.userId as string;

        // Mark all messages in this conversation as read by this user
        // We filter for ones NOT yet read by user to avoid redundant pushes if possible
        // but Prisma updateMany push might duplicate if we run it blindly.
        // However, uniqueness isn't critical for logic, just efficiency.

        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                NOT: { readBy: { has: userId } }
            },
            data: {
                readBy: {
                    push: userId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark messages as read', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
