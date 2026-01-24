'use client';

import { useState } from 'react';
import { Sparkles, Plus, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import CreatePollModal from '../polls/CreatePollModal';

export default function FeedHeader({ user }: { user: any }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <>
      <div className="relative mb-12 flex flex-col justify-between gap-8 px-2 pt-8 lg:flex-row lg:items-end md:mb-16">
        <div className="max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex w-fit items-center gap-3 rounded-2xl bg-purple-50 px-4 py-2 text-purple-600"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              {isAdmin ? 'Admin Portal' : 'Community Feed'}
            </span>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
            >
              Recent <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Announcements.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
            >
              {isAdmin
                ? "Broadcast important updates, managing community notices, and stay engaged."
                : "Stay updated with the latest community news, upcoming events, and official notices."}
            </motion.p>
          </div>
        </div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex w-full flex-row items-center gap-3 sm:w-auto"
          >
            <button
              onClick={() => setIsPollModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[2rem] border-2 border-indigo-50 bg-white px-6 py-4 text-sm font-black text-indigo-600 shadow-sm transition-all hover:border-indigo-100 hover:bg-indigo-50/50 hover:shadow-md active:scale-[0.98] sm:flex-initial"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="whitespace-nowrap">Create Poll</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[2rem] bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] sm:flex-initial"
            >
              <Plus className="h-5 w-5" />
              <span className="whitespace-nowrap">New Post</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Modal is only even rendered for Admins */}
      {isAdmin && (
        <>
          <CreateAnnouncementModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => window.location.reload()}
            user={user}
          />
          <CreatePollModal
            isOpen={isPollModalOpen}
            onClose={() => setIsPollModalOpen(false)}
            onSuccess={() => window.location.reload()}
            user={user}
          />
        </>
      )}
    </>
  );
}
