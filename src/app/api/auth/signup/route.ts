import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/token';
import { signupSchema } from '@/lib/validations/auth';
import { handleApiError, ApiError } from '@/lib/api-error';
import { sendPushNotification } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check property limit
    const config = await prisma.apartmentConfig.findFirst();
    if (config && config.maxProperties > 0) {
      const propertyCount = await prisma.property.count();
      if (propertyCount >= config.maxProperties) {
        throw new ApiError(
          403,
          'Maximum number of properties reached for this community'
        );
      }
    }

    // Check if user exists (email or phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        throw new ApiError(409, 'Email already registered');
      }
      throw new ApiError(409, 'Phone number already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        provider: 'CREDENTIALS',
        status: 'PENDING',
        notificationsEnabled: true,
        property: {
          create: {
            block: validatedData.block,
            floor: validatedData.floor,
            flatNumber: validatedData.flatNumber,
          },
        },
      },
    });

    // NOTIFY ADMINS Logic
    try {
      // Fetch all admins and filter in memory to ensure reliable targeting
      const allAdmins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
          notificationsEnabled: true,
        },
      });

      const admins = allAdmins.filter(
        (a) =>
          a.role === 'ADMIN' &&
          a.status === 'APPROVED' &&
          a.notificationsEnabled === true
      );

      if (admins.length > 0) {
        // In-app notifications
        for (const admin of admins) {
          try {
            await (prisma as any).notification.create({
              data: {
                userId: admin.id,
                title: 'New User Verification',
                message: `${user.name} has signed up and is waiting for verification.`,
                type: 'VERIFICATION_REQUEST',
                link: '/dashboard/admin/verifications',
                read: false,
                createdAt: new Date(),
              },
            });

            // Push notification
            sendPushNotification(
              admin.id,
              'New User Verification',
              `${user.name} has signed up.`,
              '/dashboard/admin/verifications'
            ).catch((err) =>
              console.error(`Push failed for ${admin.name}:`, err)
            );
          } catch (err) {
            console.error(`Failed to notify ${admin.name}:`, err);
          }
        }
      }
    } catch (notifWarn) {
      console.error(
        'Failed to trigger admin notifications during signup:',
        notifWarn
      );
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // Store refresh token
    const tokenHash = await hashPassword(refreshToken);

    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days matching token expiry
      },
    });

    // Return response with cookies
    const response = NextResponse.json({
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        status: (user as any).status,
      },
    });

    // Set HttpOnly cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
