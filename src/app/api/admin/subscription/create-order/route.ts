
import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { UserRole } from '@/generated/client';

export async function POST(request: NextRequest) {
    try {
        const user = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

        const body = await request.json();
        const { days, flatCount } = body;

        // 1. Validate Input
        if (!days || ![90, 180, 360, 540].includes(days)) {
            return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
        }

        if (!flatCount || typeof flatCount !== 'number') {
            return NextResponse.json({ error: 'Invalid flat count' }, { status: 400 });
        }

        // 2. Validate Flat Count against DB
        const totalProperties = await prisma.property.count();
        const minRequired = Math.max(totalProperties, 12);

        if (flatCount < minRequired) {
            return NextResponse.json({
                error: `Flat count cannot be less than ${minRequired} (Active Properties: ${totalProperties}, Minimum: 12)`
            }, { status: 400 });
        }

        // 3. Calculate Amount logic
        // 3m (90d): 1.5 * flats * 90
        // 6m (180d): 1.25 * flats * 180
        // 1y (360d): 1 * flats * 360
        // 1y6m (540d): (1 * flats * 360) + (0.75 * flats * 180)

        let amount = 0;

        if (days === 90) {
            amount = 1.5 * flatCount * 90;
        } else if (days === 180) {
            amount = 1.25 * flatCount * 180;
        } else if (days === 360) {
            amount = 1.0 * flatCount * 360;
        } else if (days === 540) {
            const part1 = 1.0 * flatCount * 360;
            const part2 = 0.75 * flatCount * 180; // Assuming 0.75 is the rate for the extra 6 months, or is it 6m rate? 
            // User request: "for 1y 6m :- (1y : 1 * input * 30 * 12) + (6m : 0.75* input * 30 * 6)"
            // "input * 30 * 12" is input * 360.
            // "input * 30 * 6" is input * 180.
            // So yes.
            amount = part1 + part2;
        }

        // Razorpay Keys Check
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Payment config missing' }, { status: 503 });
        }

        const options = {
            amount: Math.round(amount * 100), // paise
            currency: 'INR',
            notes: {
                userId: user.userId,
                type: 'SUBSCRIPTION',
                days: days,
                flatCount: flatCount
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            flatCount: flatCount,
        });

    } catch (error: any) {
        console.error('Subscription order error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
