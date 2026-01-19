
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { amount, description, date, category } = body;

        const updatedFinance = await prisma.communityFinance.update({
            where: { id },
            data: {
                amount: parseFloat(amount),
                description: description || "",
                date: date ? new Date(date) : undefined,
                category,
            },
            include: {
                recordedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(updatedFinance);
    } catch (error: unknown) {
        console.error("Error updating community finance record:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: "Internal Server Error", message: message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        await prisma.communityFinance.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Record deleted successfully" });
    } catch (error: unknown) {
        console.error("Error deleting community finance record:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: "Internal Server Error", message: message }, { status: 500 });
    }
}
