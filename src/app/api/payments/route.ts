import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { PaymentStatus, PaymentType, PaymentMethod } from '@/generated/client'; // Fixed import
import { createAndSendNotification } from '@/lib/notifications';

// Helper to get authenticated user
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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const queryUserId = searchParams.get('userId');
    const communityView = searchParams.get('communityView');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    // Role-based filtering
    if (user.role === 'RESIDENT') {
      // Allow residents to access community data for transparency if requested
      if (communityView === 'true') {
        // Open access to all payments (usually anonymous or summary)
        // But detailed list might be sensitive? Reference project allowed it.
        // We will allow it.
      } else {
        // Personal view
        where.userId = user.id;
      }
    } else if (
      queryUserId &&
      (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    ) {
      where.userId = queryUserId;
    }

    if (status) where.status = status as PaymentStatus;
    if (type) where.type = type as PaymentType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              property: {
                select: {
                  block: true,
                  flatNumber: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // Statistics (Optional: Only if requested or always?)
    // Let's compute basic stats always for now, or maybe separate endpoint.
    // Reference does it in same call.

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const summaryStats = await prisma.payment.aggregate({
      where: {
        ...where,
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const statusStats = await prisma.payment.groupBy({
      by: ['status'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    const typeStats = await prisma.payment.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    return NextResponse.json({
      payments: payments.map((p) => ({
        ...p,
        // Normalize user property if needed
        user: {
          ...p.user,
          property: (p.user as any).property
            ? {
                ...(p.user as any).property,
                unitNumber: (p.user as any).property.flatNumber, // Map flatNumber to unitNumber
              }
            : null,
        },
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      statistics: {
        monthlyTotal: summaryStats._sum.amount || 0,
        monthlyCount: summaryStats._count._all || 0,
        statusBreakdown: statusStats.map((s) => ({
          status: s.status,
          amount: s._sum.amount || 0,
          count: s._count._all,
        })),
        typeBreakdown: typeStats.map((t) => ({
          type: t.type,
          amount: t._sum.amount || 0,
          count: t._count._all,
        })),
      },
      enums: {
        paymentStatus: Object.values(PaymentStatus),
        paymentType: Object.values(PaymentType),
        paymentMethod: Object.values(PaymentMethod),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      amount,
      type,
      description,
      dueDate,
      paymentMethod,
      transactionId,
    } = body;

    if (!userId || !amount || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const status =
      paymentMethod && transactionId
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: type as PaymentType,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentMethod: (paymentMethod as PaymentMethod) || null,
        transactionId: transactionId || null,
        status,
        paidDate: status === PaymentStatus.COMPLETED ? new Date() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Notify User
    await createAndSendNotification(
      userId,
      'New Payment Request',
      `A new ${type.toLowerCase()} payment of ₹${amount} has been created.`,
      'PAYMENT_REQUEST',
      '/dashboard/payments'
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
