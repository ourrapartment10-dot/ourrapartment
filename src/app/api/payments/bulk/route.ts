import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { PaymentStatus, PaymentType } from '@/generated/client'; // Fixed import
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, payments } = body;

    if (operation === 'create') {
      if (!Array.isArray(payments) || payments.length === 0) {
        return NextResponse.json(
          { error: 'No payments provided' },
          { status: 400 }
        );
      }

      // Create multiple payments
      // Using transaction to ensure all or nothing? Or createMany?
      // createMany doesn't support nested relations or some checks easily but MongoDB supports it.
      // However, we might want to validate each user exists?
      // createMany is efficient.
      // Users should have been validated by frontend/modal selection ideally.

      // Prepare data
      const paymentsData = payments.map((p: any) => ({
        userId: p.userId,
        amount: parseFloat(p.amount),
        type: p.type as PaymentType,
        description: p.description,
        dueDate: p.dueDate ? new Date(p.dueDate) : null,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await prisma.payment.createMany({
        data: paymentsData,
      });

      // Notify Users
      const uniqueUsers = Array.from(
        new Set(paymentsData.map((p) => p.userId))
      );
      Promise.allSettled(
        uniqueUsers.map(async (uid) => {
          const userPayments = paymentsData.filter((p) => p.userId === uid);
          const count = userPayments.length;
          const totalAmount = userPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );

          await createAndSendNotification(
            uid,
            'New Payment Request',
            `You have ${count} new payment request${count > 1 ? 's' : ''} totaling ₹${totalAmount}.`,
            'PAYMENT_REQUEST',
            '/dashboard/payments'
          );
        })
      );

      return NextResponse.json(
        {
          success: true,
          message: `Successfully created ${result.count} payments`,
          count: result.count,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Operation not supported' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
