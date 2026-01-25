
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware-helpers';

export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        const latestSub = await prisma.communitySubscription.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { endDate: 'desc' },
        });

        if (!latestSub) {
            return NextResponse.json({
                active: false,
                daysRemaining: 0,
                expiresOn: null
            });
        }

        if (latestSub.isLifetime) {
            const totalProperties = await prisma.property.count();
            return NextResponse.json({
                active: true,
                isLifetime: true,
                daysRemaining: '∞',
                expiresOn: null,
                totalProperties
            });
        }

        const now = new Date();
        const expiresOn = new Date(latestSub.endDate);
        const diffTime = expiresOn.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const totalProperties = await prisma.property.count();

        return NextResponse.json({
            active: daysRemaining > 0,
            isLifetime: false,
            daysRemaining,
            expiresOn: expiresOn.toISOString(),
            totalProperties
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
