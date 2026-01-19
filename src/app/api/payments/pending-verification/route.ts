import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { PaymentStatus } from '@/generated/client'; // Fixed import

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
    // Only Admin can see verification queue
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING_VERIFICATION,
      },
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
                flatNumber: true, // Current schema uses flatNumber, mapped to unitNumber logic if needed
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Most recently submitted first
      },
    });

    // Normalize property for frontend if consistent naming is desired (e.g. unitNumber)
    // Frontend expects: block, unitNumber
    const normalizedPayments = payments.map((p) => ({
      ...p,
      user: {
        ...p.user,
        property: p.user.property
          ? {
              ...p.user.property,
              unitNumber: p.user.property.flatNumber,
            }
          : null,
      },
    }));

    return NextResponse.json({
      payments: normalizedPayments,
      count: payments.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch verification queue' },
      { status: 500 }
    );
  }
}
