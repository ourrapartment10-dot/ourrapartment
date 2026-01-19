'use client';

import { User as UserIcon } from 'lucide-react';
import { ProfileSettings } from '@/components/shared/ProfileSettings';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-outfit flex items-center gap-2 text-2xl font-bold text-gray-900">
            <UserIcon className="h-6 w-6 text-blue-600" />
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and update your personal information.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <ProfileSettings />
      </div>
    </div>
  );
}
