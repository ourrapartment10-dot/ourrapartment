import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export async function createAndSendNotification(
  userId: string,
  title: string,
  message: string,
  type: string, // e.g., "PAYMENT_REQUEST", "PAYMENT_COMPLETED"
  link: string = '/dashboard'
) {
  try {
    // Create DB notification
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        read: false,
      },
    });

    // Send Push
    await sendPushNotification(userId, title, message, link);
  } catch (err) {
    console.error('Failed to notify user:', userId, err);
  }
}
