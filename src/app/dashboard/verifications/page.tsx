'use client';

import UserVerificationList from '@/components/admin/UserVerificationList';
import { CheckCircle2 } from 'lucide-react';

export default function VerificationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-outfit flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
            Residential Verifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new resident registrations for the community.
          </p>
        </div>
      </div>

      <UserVerificationList />
    </div>
  );
}
