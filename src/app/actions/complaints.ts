'use server';

import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { UserRole, ComplaintType, ComplaintStatus } from '@/generated/client';
import { sendPushNotification } from '@/lib/push';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload || !payload.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, role: true, name: true },
  });
}

export async function getComplaintStats() {
  const user = await getAuthenticatedUser();
  if (!user) return { avgRating: 0, avgResolutionHours: 0, totalResolved: 0 };

  // Fetch all resolved complaints that have a rating
  const ratedComplaints = await prisma.complaint.findMany({
    where: {
      status: ComplaintStatus.RESOLVED,
      rating: { not: null },
    },
    select: { rating: true },
  });

  const totalRated = ratedComplaints.length;
  const avgRating =
    totalRated > 0
      ? ratedComplaints.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
        totalRated
      : 0;

  // Fetch resolution times (for all resolved, regardless of rating)
  const resolvedComplaints = await prisma.complaint.findMany({
    where: { status: ComplaintStatus.RESOLVED },
    select: { createdAt: true, resolvedAt: true },
  });

  const totalResolved = resolvedComplaints.length;
  let totalHours = 0;

  resolvedComplaints.forEach((c) => {
    if (c.resolvedAt) {
      const diff = c.resolvedAt.getTime() - c.createdAt.getTime();
      totalHours += diff / (1000 * 60 * 60);
    }
  });

  const avgResolutionHours = totalResolved > 0 ? totalHours / totalResolved : 0;

  return {
    avgRating: parseFloat(avgRating.toFixed(1)),
    avgResolutionHours: Math.round(avgResolutionHours),
    totalResolved,
  };
}

export async function createComplaint(data: {
  title: string;
  description: string;
  type: ComplaintType;
  images?: string[];
}) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const complaint = await prisma.complaint.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      images: data.images || [],
      userId: user.id,
    },
  });

  // Notify Admins
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, status: 'APPROVED' },
    select: { id: true },
  });

  const title = 'New Complaint';
  const message = `${user.name || 'A resident'} submitted a ${data.type.toLowerCase()} complaint: ${data.title}`;
  const link = '/dashboard/complaints';

  const notificationPromises = admins.map(async (admin) => {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title,
        message,
        type: 'COMPLAINT_NEW',
        link,
        read: false,
      },
    });
    await sendPushNotification(admin.id, title, message, link).catch(
      console.error
    );
  });

  await Promise.allSettled(notificationPromises);

  return complaint;
}

export async function getComplaints(filter?: {
  type?: ComplaintType;
  status?: ComplaintStatus;
  myComplaints?: boolean;
}) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  let whereClause: any = {};

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    // Admins can see all PUBLIC complaints.
    // And ALL PRIVATE complaints? "private all admins can see" -> Yes.
    // So Admins see everything.
  } else {
    // Residents can see ALL PUBLIC complaints.
    // Residents can see THEIR OWN PRIVATE complaints.
    if (filter?.myComplaints) {
      whereClause.userId = user.id;
    } else {
      // General view: Public OR Own Private
      whereClause.OR = [{ type: ComplaintType.PUBLIC }, { userId: user.id }];
    }
  }

  if (filter?.type) whereClause.type = filter.type;
  if (filter?.status) whereClause.status = filter.status;

  // Override logic if strict "My Complaints" is requested
  if (filter?.myComplaints) {
    whereClause.userId = user.id;
    // If type/status filters are present, they are already applied to whereClause
  }

  return prisma.complaint.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
          image: true,
          property: { select: { flatNumber: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resolveComplaint(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Permission denied');
  }

  const complaint = await prisma.complaint.update({
    where: { id },
    data: {
      status: ComplaintStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedBy: user.id,
    },
  });

  // Notify the issuer
  const title = 'Complaint Resolved';
  const message = `Your complaint "${complaint.title}" has been resolved.`;
  const link = `/dashboard/complaints?id=${complaint.id}`; // OR just list

  await prisma.notification.create({
    data: {
      userId: complaint.userId,
      title,
      message,
      type: 'COMPLAINT_RESOLVED',
      link,
      read: false,
    },
  });
  await sendPushNotification(complaint.userId, title, message, link).catch(
    console.error
  );

  return complaint;
}

export async function updateComplaint(
  id: string,
  data: {
    title: string;
    description: string;
    type: ComplaintType;
    images?: string[];
  }
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const existingComplaint = await prisma.complaint.findUnique({
    where: { id },
  });
  if (!existingComplaint) throw new Error('Complaint not found');

  if (existingComplaint.userId !== user.id)
    throw new Error('Permission denied');

  if (existingComplaint.status === ComplaintStatus.RESOLVED) {
    throw new Error('Cannot edit a resolved complaint');
  }

  return prisma.complaint.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      images: data.images || [],
    },
  });
}

export async function submitComplaintFeedback(
  id: string,
  rating: number,
  feedback: string
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) throw new Error('Complaint not found');

  if (complaint.userId !== user.id) throw new Error('Permission denied');

  return prisma.complaint.update({
    where: { id },
    data: {
      rating,
      feedback,
    },
  });
}
