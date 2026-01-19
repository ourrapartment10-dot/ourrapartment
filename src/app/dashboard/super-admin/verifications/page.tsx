'use client';

import UserVerificationList from '@/components/admin/UserVerificationList';
import { ShieldCheck } from 'lucide-react';

export default function SuperAdminVerificationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-outfit flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            Platform-wide Verifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Global oversight of all pending registrations across all properties.
          </p>
        </div>
      </div>

      <UserVerificationList />
    </div>
  );
}
