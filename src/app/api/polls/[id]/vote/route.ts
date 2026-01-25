import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { pusherServer } from '@/lib/pusher';

// POST: Vote on Poll
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const pollId = params.id;

  try {
    const { userId } = await requireAuth();

    const body = await req.json();
    const { optionId } = body;

    if (!optionId) {
      throw new ApiError(400, 'Option ID is required');
    }

    // Check if poll exists and is still open
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      throw new ApiError(404, 'Poll not found');
    }

    if (poll.endsAt && new Date() > poll.endsAt) {
      throw new ApiError(400, 'This poll has ended');
    }

    // Check if user already voted on this poll
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId: pollId,
        userId: userId,
      },
    });

    if (existingVote) {
      // Option 1: Allow changing vote
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionId },
      });
    } else {
      // Option 2: Record new vote
      await prisma.pollVote.create({
        data: {
          pollId,
          optionId,
          userId,
        },
      });
    }

    // Get updated results
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    // Trigger real-time update
    await pusherServer.trigger(`poll-${pollId}`, 'vote-updated', {
      pollId,
      options: updatedPoll?.options.map((opt) => ({
        id: opt.id,
        count: opt._count.votes,
      })),
    });

    return NextResponse.json({ success: true, message: 'Vote recorded' });
  } catch (error) {
    return handleApiError(error);
  }
}
