import { NextResponse } from "next/server";

export async function GET() {
    const isConfigured = !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    return NextResponse.json({
        configured: isConfigured,
        testMode: !isConfigured // If validation logic was more complex, we'd check specifics. Here missing keys = test mode/unavailable.
    });
}
