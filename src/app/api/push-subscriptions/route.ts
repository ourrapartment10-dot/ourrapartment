import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const subscription = await req.json();

    // Save or update subscription
    // We use endpoint as a unique identifier for the subscription
    await (prisma as any).pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId: payload.userId as string,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId: payload.userId as string,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    await (prisma as any).pushSubscription.deleteMany({
      where: {
        endpoint: endpoint,
      },
    });

    return NextResponse.json({ message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
