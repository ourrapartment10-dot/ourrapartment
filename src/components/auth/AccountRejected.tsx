'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { LogOut, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountRejected() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="font-outfit mb-2 text-2xl font-bold text-gray-900">
          Application Rejected
        </h1>
        <p className="mb-6 text-gray-500">
          We're sorry,{' '}
          <span className="font-bold text-gray-700">{user?.name}</span>. Your
          residential application has been reviewed and could not be approved at
          this time.
        </p>

        <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-left">
          <div className="mb-2 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wider uppercase">
              Reason provided
            </span>
          </div>
          <p className="text-sm font-medium text-red-600 italic">
            "
            {(user as any)?.rejectionReason ||
              'No specific reason provided. Please contact the administrator for details.'}
            "
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>

          <a
            href="mailto:support@ourrapartment.com"
            className="block w-full rounded-2xl border border-gray-200 bg-white py-4 font-bold text-gray-700 transition-all hover:bg-gray-50"
          >
            Appeal Decision
          </a>
        </div>

        <p className="mt-8 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          OurApartment Verification System
        </p>
      </motion.div>
    </div>
  );
}
