
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { UserRole } from '@/generated/client';

export async function POST(request: NextRequest) {
    try {
        const user = await requireRole([UserRole.SUPER_ADMIN]);

        const body = await request.json();
        const { type, days: customDays } = body;

        let daysToAdd = 0;
        let planName = '';

        if (type === 'TRIAL') {
            daysToAdd = 70;
            planName = 'Free Trial (70 Days)';
        } else if (type === 'LIFETIME') {
            daysToAdd = 365 * 50; // 50 years
            planName = 'Lifetime Access';
        } else if (type === 'CUSTOM') {
            daysToAdd = Number(customDays) || 30;
            planName = `Custom Grant (${daysToAdd} Days)`;
        } else {
            return NextResponse.json({ error: 'Invalid grant type' }, { status: 400 });
        }

        // Determine Start Date
        const latestSub = await prisma.communitySubscription.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { endDate: 'desc' },
        });

        let startDate = new Date();
        if (latestSub && latestSub.endDate > new Date()) {
            startDate = new Date(latestSub.endDate);
        }

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + daysToAdd);

        const subscription = await prisma.communitySubscription.create({
            data: {
                planName,
                durationInDays: daysToAdd,
                amount: 0,
                startDate,
                endDate,
                status: 'ACTIVE',
                createdById: user.userId,
                razorpayPaymentId: `GRANT_${type}_${Date.now()}`
            }
        });

        return NextResponse.json({ success: true, subscription });

    } catch (error) {
        console.error('Grant subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
