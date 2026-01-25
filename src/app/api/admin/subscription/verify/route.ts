
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { requireRole } from '@/lib/auth/middleware-helpers';
import { PaymentStatus, PaymentMethod, PaymentType, UserRole } from '@/generated/client';

export async function POST(request: NextRequest) {
    try {
        const user = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            days,
            amount // Expected in paise (from Razorpay response)
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !days) {
            return NextResponse.json(
                { error: 'Missing payment details' },
                { status: 400 }
            );
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Determine Start and End Dates
        const latestSub = await prisma.communitySubscription.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { endDate: 'desc' },
        });

        let startDate = new Date();
        // If there is an active subscription ensuring no gap, start from its end date
        // Only if its end date is in the future
        if (latestSub && latestSub.endDate > new Date()) {
            startDate = new Date(latestSub.endDate);
        }

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        const amountInRupees = amount ? amount / 100 : 0;

        // Create Subscription
        const subscription = await prisma.communitySubscription.create({
            data: {
                planName: `${days} Days Plan`,
                durationInDays: days,
                amount: amountInRupees,
                startDate,
                endDate,
                status: 'ACTIVE',
                razorpayPaymentId: razorpay_payment_id,
                createdById: user.userId,
            }
        });

        // Create Payment Record
        await prisma.payment.create({
            data: {
                amount: amountInRupees,
                type: PaymentType.SUBSCRIPTION,
                status: PaymentStatus.COMPLETED,
                paymentMethod: PaymentMethod.ONLINE,
                description: `Subscription for ${days} days`,
                userId: user.userId,
                transactionId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paidDate: new Date(),
            }
        });

        return NextResponse.json({
            success: true,
            subscription
        });

    } catch (error: any) {
        console.error('Subscription verification error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
