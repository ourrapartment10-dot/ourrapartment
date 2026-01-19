import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) return null;
    return await prisma.user.findUnique({ where: { id: payload.userId as string } });
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { paymentIds, amount, currency = "INR" } = body;

        // Check if Razorpay keys are configured
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay keys missing");
            return NextResponse.json({
                error: "Payment gateway configuration missing",
                testMode: true
            }, { status: 503 });
        }

        // Create order options
        const options = {
            amount: Math.round(amount * 100), // Convert to subunits (paise)
            currency,
            notes: {
                userId: user.id,
                paymentIds: JSON.stringify(paymentIds) // Store payment IDs in notes for verification context if needed
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Razorpay create order error:", error);
        return NextResponse.json({
            error: error.message || "Failed to create order"
        }, { status: 500 });
    }
}
