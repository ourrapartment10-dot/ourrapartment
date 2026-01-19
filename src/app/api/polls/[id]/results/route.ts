import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET: Poll Results (Voters)
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const pollId = params.id;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new ApiError(401, "Unauthorized");

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) throw new ApiError(401, "Unauthorized");

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        votes: {
                            include: {
                                user: {
                                    select: { id: true, name: true, image: true }
                                }
                            }
                        },
                        _count: {
                            select: { votes: true }
                        }
                    }
                }
            }
        });

        if (!poll) {
            throw new ApiError(404, "Poll not found");
        }

        // If anonymous, strip out user details from votes
        if (poll.isAnonymous) {
            const sanitizedOptions = poll.options.map(opt => ({
                id: opt.id,
                text: opt.text,
                count: opt._count.votes,
                votes: [] // Empty voters for anonymous polls
            }));
            return NextResponse.json({ ...poll, options: sanitizedOptions });
        }

        return NextResponse.json(poll);
    } catch (error) {
        return handleApiError(error);
    }
}
