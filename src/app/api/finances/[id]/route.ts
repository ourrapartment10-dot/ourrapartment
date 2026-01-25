import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware-helpers';
// import { cookies } from 'next/headers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();

    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, description, date, category } = body;

    const updatedFinance = await prisma.communityFinance.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description: description || '',
        date: date ? new Date(date) : undefined,
        category,
      },
      include: {
        recordedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedFinance);
  } catch (error: unknown) {
    console.error('Error updating community finance record:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', message: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await requireAuth();

    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.communityFinance.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting community finance record:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', message: message },
      { status: 500 }
    );
  }
}
