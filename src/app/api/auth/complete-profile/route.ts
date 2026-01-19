import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api-error";
import { completeProfileSchema } from "@/lib/validations/auth";
import { sendPushNotification } from "@/lib/push";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyAccessToken(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();

        // Validate with Zod
        const validatedData = completeProfileSchema.parse(body);
        const { phone } = validatedData;

        // Check property limit
        const config = await prisma.apartmentConfig.findFirst();
        if (config && config.maxProperties > 0) {
            const userWithProperty = await prisma.user.findUnique({
                where: { id: payload.userId as string },
                include: { property: true }
            });

            if (!userWithProperty?.property) {
                const propertyCount = await prisma.property.count();
                if (propertyCount >= config.maxProperties) {
                    return NextResponse.json({ error: "Maximum number of properties reached for this community" }, { status: 403 });
                }
            }
        }

        // Check if phone is already taken
        const existingPhone = await prisma.user.findFirst({
            where: { phone, id: { not: payload.userId as string } }
        });

        if (existingPhone) {
            return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: payload.userId as string },
            data: {
                phone,
                property: {
                    upsert: {
                        create: {
                            block: validatedData.block,
                            floor: validatedData.floor,
                            flatNumber: validatedData.flatNumber
                        },
                        update: {
                            block: validatedData.block,
                            floor: validatedData.floor,
                            flatNumber: validatedData.flatNumber
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                image: true,
                phone: true
            }
        });

        // Notify Admins
        try {
            // Fetch all admins and filter in memory to ensure reliable targeting
            const allAdmins = await prisma.user.findMany({
                where: {
                    role: { in: ["ADMIN", "SUPER_ADMIN"] }
                },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    status: true,
                    notificationsEnabled: true
                }
            });

            const admins = allAdmins.filter(a =>
                a.role === "ADMIN" &&
                a.status === "APPROVED" &&
                a.notificationsEnabled === true
            );

            if (admins.length > 0) {
                console.log("Creating notifications for admins...");
                for (const admin of admins) {
                    try {
                        const newNotif = await (prisma as any).notification.create({
                            data: {
                                userId: admin.id,
                                title: "New Verification Request",
                                message: `${updatedUser.name} has requested to join the community.`,
                                type: "VERIFICATION_REQUEST",
                                link: "/dashboard/settings",
                                read: false,
                                createdAt: new Date()
                            }
                        });
                        console.log(`In-app notification created for ${admin.name}:`, newNotif.id);

                        // Send push notification
                        sendPushNotification(
                            admin.id,
                            "New Verification Request",
                            `${updatedUser.name} has requested to join the community.`,
                            "/dashboard/settings"
                        ).then(() => console.log(`Push sent to ${admin.name}`))
                            .catch(err => console.error(`Push failed for ${admin.name}:`, err));
                    } catch (err) {
                        console.error(`Failed to notify ${admin.name}:`, err);
                    }
                }
            } else {
                console.log("No admins found matching criteria.");
            }
        } catch (notifError) {
            console.error("Failed to process general notification logic:", notifError);
        }

        return NextResponse.json({
            message: "Profile updated",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                image: updatedUser.image,
                phone: updatedUser.phone
            }
        });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
