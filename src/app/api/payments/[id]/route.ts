import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { PaymentStatus, PaymentType, PaymentMethod } from '@/generated/client'; // Fixed import
import { createAndSendNotification } from '@/lib/notifications';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload || !payload.userId) return null;
  return await prisma.user.findUnique({
    where: { id: payload.userId as string },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!payment)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    // Access control
    if (user.role === 'RESIDENT' && payment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existingPayment = await prisma.payment.findUnique({ where: { id } });
    if (!existingPayment)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    // Prevent modification of completed payments
    if (existingPayment.status === PaymentStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Completed payments cannot be modified' },
        { status: 400 }
      );
    }

    // Resident Update (Manual Payment Submission)
    if (user.role === 'RESIDENT') {
      if (existingPayment.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Residents can only update payment method and transaction ID to request verification
      // They cannot change amount, type, or mark as COMPLETED directly.

      const { paymentMethod, transactionId, status } = body;

      // Only allow transition to PENDING_VERIFICATION
      if (status && status !== PaymentStatus.PENDING_VERIFICATION) {
        return NextResponse.json(
          { error: 'Residents can only submit for verification' },
          { status: 403 }
        );
      }

      const updateData: any = {};
      if (paymentMethod)
        updateData.paymentMethod = paymentMethod as PaymentMethod;
      // Transaction ID is optional but if provided it should be updated
      if (transactionId !== undefined) updateData.transactionId = transactionId;

      if (status === PaymentStatus.PENDING_VERIFICATION) {
        updateData.status = PaymentStatus.PENDING_VERIFICATION;
      }

      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(updatedPayment);
    }

    // Admin Update
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const {
        status,
        paymentMethod,
        transactionId,
        paidDate,
        amount,
        type,
        description,
        dueDate,
      } = body;

      const updateData: any = {};
      if (status) updateData.status = status as PaymentStatus;
      if (paymentMethod)
        updateData.paymentMethod = paymentMethod as PaymentMethod;
      if (transactionId !== undefined) updateData.transactionId = transactionId;
      if (paidDate) updateData.paidDate = new Date(paidDate);
      if (amount) updateData.amount = parseFloat(amount);
      if (type) updateData.type = type as PaymentType;
      if (description) updateData.description = description;
      if (dueDate) updateData.dueDate = new Date(dueDate);

      // Auto-set paidDate if completing
      if (
        status === PaymentStatus.COMPLETED &&
        !paidDate &&
        !existingPayment.paidDate
      ) {
        updateData.paidDate = new Date();
      }

      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: updateData,
      });

      // Notify if status changed to COMPLETED
      if (updateData.status === PaymentStatus.COMPLETED) {
        await createAndSendNotification(
          existingPayment.userId,
          'Payment Verified',
          `Your payment of ₹${existingPayment.amount} has been successfully verified.`,
          'PAYMENT_COMPLETED',
          '/dashboard/payments'
        );
      }

      return NextResponse.json(updatedPayment);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const existingPayment = await prisma.payment.findUnique({ where: { id } });
    if (!existingPayment)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    if (existingPayment.status === PaymentStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Completed payments cannot be deleted' },
        { status: 400 }
      );
    }

    await prisma.payment.delete({ where: { id } });

    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
