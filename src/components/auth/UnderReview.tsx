'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { LogOut, Clock, ShieldCheck, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UnderReview() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
          <Clock className="h-10 w-10 animate-pulse text-blue-600" />
        </div>

        <h1 className="font-outfit mb-2 text-2xl font-bold text-gray-900">
          Profile Under Review
        </h1>
        <p className="mb-8 text-gray-500">
          Welcome, <span className="font-bold text-gray-700">{user?.name}</span>
          ! Your account has been created successfully and is currently being
          verified by our administrators.
        </p>

        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Status
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Verification Pending
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left">
              <Mail className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Email
              </p>
              <p className="truncate text-xs font-semibold text-gray-700">
                {user?.email}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left">
              <Phone className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Phone
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {user?.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-sm font-medium text-blue-700">
            You'll receive full access to the dashboard once an admin approves
            your residence.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          Sign Out & Check Later
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Need help? Contact{' '}
          <a
            href="mailto:support@ourrapartment.com"
            className="font-bold text-blue-600 hover:underline"
          >
            Support
          </a>
        </p>
      </motion.div>
    </div>
  );
}
