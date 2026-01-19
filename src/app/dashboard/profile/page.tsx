"use client";

import { User as UserIcon } from "lucide-react";
import { ProfileSettings } from "@/components/shared/ProfileSettings";

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                        My Profile
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View and update your personal information.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 lg:p-10">
                <ProfileSettings />
            </div>
        </div>
    );
}
