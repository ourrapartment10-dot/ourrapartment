
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { UserRole } from "@/generated/client";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = payload.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const userRole = user.role;

        // Fetch Apartment Config for total units
        const config = await prisma.apartmentConfig.findFirst();
        const totalUnits = config?.maxProperties || 0;

        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
            // --- ADMIN STATS ---
            const [
                totalResidents,
                totalPropertiesCount,
                occupiedProperties,
                pendingComplaints,
                todaysBookingsCount,
                pendingPaymentsCount,
                resolvedComplaints,
                totalComplaints,
                totalRevenue,
                totalExpenses,
                activePolls,
                latestEvent
            ] = await Promise.all([
                prisma.user.count({ where: { role: "RESIDENT" } }),
                prisma.property.count(),
                prisma.property.count({ where: { userId: { not: null } } }),
                prisma.complaint.count({ where: { status: "OPEN" } }),
                prisma.facilityBooking.count({
                    where: {
                        startTime: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lt: new Date(new Date().setHours(24, 0, 0, 0)),
                        },
                    },
                }),
                prisma.payment.count({ where: { status: "PENDING" } }),
                prisma.complaint.count({ where: { status: "RESOLVED" } }),
                prisma.complaint.count(),
                prisma.payment.aggregate({
                    where: { status: "COMPLETED" },
                    _sum: { amount: true }
                }),
                prisma.communityFinance.aggregate({
                    where: { type: "expense" },
                    _sum: { amount: true }
                }),
                prisma.poll.findMany({
                    where: { endsAt: { gte: new Date() } },
                    take: 3,
                    orderBy: { createdAt: "desc" },
                    include: { _count: { select: { votes: true } } }
                }),
                // Use latest announcement as "event" if it contains "meeting" or "event" or just the latest pinned one
                prisma.announcement.findFirst({
                    where: {
                        OR: [
                            { isPinned: true },
                            { title: { contains: "Event", mode: "insensitive" } },
                            { title: { contains: "Meeting", mode: "insensitive" } }
                        ]
                    },
                    orderBy: { createdAt: "desc" }
                })
            ]);

            const monthlyRevenue = await Promise.all(
                Array.from({ length: 6 }).map(async (_, i) => {
                    const date = subMonths(new Date(), i);
                    const start = startOfMonth(date);
                    const end = endOfMonth(date);
                    const sum = await prisma.payment.aggregate({
                        where: {
                            status: "COMPLETED",
                            paidDate: { gte: start, lte: end }
                        },
                        _sum: { amount: true }
                    });
                    return {
                        month: date.toLocaleString('default', { month: 'short' }),
                        amount: sum._sum.amount || 0
                    };
                })
            );

            const [recentBookings, recentComplaints, recentAnnouncements, recentPayments] = await Promise.all([
                prisma.facilityBooking.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { user: true, facility: true }
                }),
                prisma.complaint.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { user: true }
                }),
                prisma.announcement.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { author: true }
                }),
                prisma.payment.findMany({
                    where: { status: "COMPLETED" },
                    take: 5,
                    orderBy: { updatedAt: "desc" },
                    include: { user: true }
                })
            ]);

            const activities = [
                ...recentBookings.map(b => ({
                    id: b.id,
                    type: "BOOKING",
                    title: `Booking: ${b.facility.name}`,
                    subtitle: `By ${b.user.name}`,
                    date: b.createdAt,
                    status: b.status
                })),
                ...recentComplaints.map(c => ({
                    id: c.id,
                    type: "COMPLAINT",
                    title: `Complaint: ${c.title}`,
                    subtitle: `By ${c.user.name}`,
                    date: c.createdAt,
                    status: c.status
                })),
                ...recentAnnouncements.map(a => ({
                    id: a.id,
                    type: "ANNOUNCEMENT",
                    title: `Notice: ${a.title}`,
                    subtitle: `By Admin`,
                    date: a.createdAt
                })),
                ...recentPayments.map(p => ({
                    id: p.id,
                    type: "PAYMENT",
                    title: `Payment: ₹${p.amount}`,
                    subtitle: `By ${p.user.name}`,
                    date: p.updatedAt,
                    status: "PAID"
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

            return NextResponse.json({
                role: userRole,
                stats: {
                    totalResidents,
                    totalProperties: totalUnits || totalPropertiesCount,
                    occupiedProperties,
                    pendingComplaints,
                    todaysBookings: todaysBookingsCount,
                    pendingPayments: pendingPaymentsCount,
                    totalRevenue: totalRevenue._sum.amount || 0,
                    totalExpenses: totalExpenses._sum.amount || 0
                },
                performance: {
                    resolvedComplaints,
                    totalComplaints
                },
                charts: {
                    revenue: monthlyRevenue.reverse()
                },
                activePolls,
                latestEvent,
                activities
            });

        } else {
            // --- RESIDENT STATS ---
            const [
                myPendingPayments,
                myOpenComplaints,
                myUpcomingBookingsCount,
                myProperties,
                activePolls,
                latestEvent
            ] = await Promise.all([
                prisma.payment.count({ where: { userId, status: "PENDING" } }),
                prisma.complaint.count({ where: { userId, status: "OPEN" } }),
                prisma.facilityBooking.count({
                    where: {
                        userId,
                        startTime: { gte: new Date() },
                        status: "APPROVED"
                    }
                }),
                prisma.property.findMany({ where: { userId } }),
                prisma.poll.findMany({
                    where: { endsAt: { gte: new Date() } },
                    take: 3,
                    orderBy: { createdAt: "desc" },
                    include: { _count: { select: { votes: true } } }
                }),
                prisma.announcement.findFirst({
                    where: {
                        OR: [
                            { isPinned: true },
                            { title: { contains: "Event", mode: "insensitive" } },
                            { title: { contains: "Meeting", mode: "insensitive" } }
                        ]
                    },
                    orderBy: { createdAt: "desc" }
                })
            ]);

            const myPaymentHistory = await Promise.all(
                Array.from({ length: 6 }).map(async (_, i) => {
                    const date = subMonths(new Date(), i);
                    const start = startOfMonth(date);
                    const end = endOfMonth(date);
                    const sum = await prisma.payment.aggregate({
                        where: {
                            userId,
                            status: "COMPLETED",
                            paidDate: { gte: start, lte: end }
                        },
                        _sum: { amount: true }
                    });
                    return {
                        month: date.toLocaleString('default', { month: 'short' }),
                        amount: sum._sum.amount || 0
                    };
                })
            );

            const [recentAnnouncements, myRecentActivity] = await Promise.all([
                prisma.announcement.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { author: true }
                }),
                prisma.facilityBooking.findMany({
                    where: { userId },
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { facility: true }
                })
            ]);

            const activities = [
                ...recentAnnouncements.map(a => ({
                    id: a.id,
                    type: "ANNOUNCEMENT",
                    title: a.title,
                    subtitle: `Posted by Admin`,
                    date: a.createdAt
                })),
                ...myRecentActivity.map(b => ({
                    id: b.id,
                    type: "BOOKING",
                    title: `Booking: ${b.facility.name}`,
                    subtitle: b.status,
                    date: b.createdAt
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

            return NextResponse.json({
                role: userRole,
                stats: {
                    pendingPayments: myPendingPayments,
                    openComplaints: myOpenComplaints,
                    upcomingBookings: myUpcomingBookingsCount,
                    property: myProperties[0] || null
                },
                charts: {
                    payments: myPaymentHistory.reverse()
                },
                activePolls,
                latestEvent,
                activities
            });
        }
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
