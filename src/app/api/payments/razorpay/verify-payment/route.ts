import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PaymentStatus, PaymentMethod } from '@/generated/client'; // Fixed import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentIds,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // Update Payments
    if (Array.isArray(paymentIds) && paymentIds.length > 0) {
      await prisma.payment.updateMany({
        where: {
          id: { in: paymentIds },
        },
        data: {
          status: PaymentStatus.COMPLETED,
          paymentMethod: PaymentMethod.ONLINE, // or UP/CARD based on razorpay details if we fetched them. ONLINE is safe generic.
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          transactionId: razorpay_payment_id, // Use RP ID as transaction ID
          paidDate: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and updated successfully',
      payment: { status: 'COMPLETED' },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
