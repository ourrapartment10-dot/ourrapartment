import webpush from 'web-push';
import { prisma } from './prisma';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@ourrapartment.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not found. Push notifications will not be sent.');
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    const notifications = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({ title, body, url })
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          console.log(`Removing expired subscription: ${sub.endpoint}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error(
            'Error sending push notification to endpoint:',
            sub.endpoint,
            error
          );
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error in sendPushNotification wrapper:', error);
  }
}
