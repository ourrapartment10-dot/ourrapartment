'use client';

import { motion } from 'framer-motion';
import { User as UserIcon, Settings } from 'lucide-react';
import { ProfileSettings } from '@/components/shared/ProfileSettings';

export default function ProfilePage() {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] pb-20 sm:pb-0">
      <div className="relative px-2 pt-8 mb-8">
        <div className="max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex w-fit items-center gap-3 rounded-2xl bg-blue-50 px-4 py-2 text-blue-600"
          >
            <Settings className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Account Settings
            </span>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
            >
              My <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Profile.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
            >
              Manage your personal information, privacy, and account security.
            </motion.p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10 lg:p-12"
      >
        <ProfileSettings />
      </motion.div>
    </div>
  );
}
