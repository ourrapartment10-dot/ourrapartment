
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { UserRole } from '@/generated/client';

export async function POST(request: NextRequest) {
    try {
        const user = await requireRole([UserRole.SUPER_ADMIN]);
        const { enable } = await request.json();

        if (enable) {
            // Enable Lifetime Access
            // Deactivate any existing active subscriptions? Or just add a new one?
            // Let's add a new one that starts now and effectively never ends (or just verify flag)

            // expire current active ones first to avoid confusion? 
            // Or just create the lifetime one which will be picked up by `findFirst` desc order if we set date far future or rely on checking `isLifetime` first.
            // The status route checks `isLifetime` on `latestSub`.
            // So we need to ensure this new subscription is arguably the "latest".

            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 100); // 100 years from now

            await prisma.communitySubscription.create({
                data: {
                    planName: 'Lifetime Access',
                    durationInDays: 36500,
                    amount: 0,
                    startDate,
                    endDate,
                    isLifetime: true,
                    status: 'ACTIVE',
                    createdById: user.userId,
                    razorpayPaymentId: `GRANT_LIFETIME_${Date.now()}`
                }
            });

        } else {
            // Disable Lifetime Access
            // Find currently active lifetime subscriptions and expire them
            await prisma.communitySubscription.updateMany({
                where: {
                    isLifetime: true,
                    status: 'ACTIVE'
                },
                data: {
                    status: 'EXPIRED',
                    endDate: new Date() // Expire immediately
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Toggle lifetime subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
