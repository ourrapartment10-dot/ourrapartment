
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/token";

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) return null;

    return await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: { id: true, role: true }
    });
}

export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !["ADMIN", "RESIDENT", "SUPER_ADMIN"].includes(user.role)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where: any = {};
        if (category && category !== "all") where.category = category;
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Parallel calls for performance
        const [finances, totalExpensesAggregate, totalCount, totalIncomeAggregate, incomeRecords] = await Promise.all([
            prisma.communityFinance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: "desc" },
                include: {
                    recordedBy: {
                        select: { name: true, email: true }
                    }
                }
            }),
            prisma.communityFinance.aggregate({
                where,
                _sum: { amount: true },
            }),
            prisma.communityFinance.count({ where }),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { amount: true },
            }),
            prisma.payment.findMany({
                where: {
                    status: "COMPLETED",
                    ...(startDate && endDate ? {
                        paidDate: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        }
                    } : {})
                },
                take: 50, // Recent payments for analytics
                orderBy: { paidDate: "desc" },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            })
        ]);

        const totalIncome = totalIncomeAggregate._sum.amount || 0;
        const totalExpenses = totalExpensesAggregate._sum.amount || 0;
        const netBalance = totalIncome - totalExpenses;

        return NextResponse.json({
            finances,
            incomeRecords: incomeRecords.map(p => ({
                id: p.id,
                amount: p.amount,
                type: "income",
                category: "payment",
                description: p.description,
                date: p.paidDate || p.createdAt,
                recordedBy: p.user
            })),
            totalRecords: totalCount,
            totalIncome,
            totalExpenses,
            netBalance,
            page,
            limit,
        });
    } catch (error: unknown) {
        console.error("Error fetching community finances:", error);
        const message = error instanceof Error ? error.message : "Strings error";
        return new NextResponse(JSON.stringify({ error: "Internal Server Error", details: message }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { amount, description, date, category } = body;

        if (!amount || !category) {
            return NextResponse.json({ error: "Missing required fields: amount and category" }, { status: 400 });
        }

        const newFinance = await prisma.communityFinance.create({
            data: {
                amount: parseFloat(amount),
                type: "expense",
                description: description || "",
                date: date ? new Date(date) : new Date(),
                category,
                recordedById: user.id,
            },
            include: {
                recordedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(newFinance, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating community finance record:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            error: "Internal Server Error",
            message: message
        }, { status: 500 });
    }
}
