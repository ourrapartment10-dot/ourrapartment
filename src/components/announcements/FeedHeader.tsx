'use client';

import { useState } from 'react';
import { Sparkles, Plus, BarChart3 } from 'lucide-react';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import CreatePollModal from '../polls/CreatePollModal';

export default function FeedHeader({ user }: { user: any }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <>
      <div className="mx-auto mb-8 flex w-full max-w-2xl flex-col items-center justify-between gap-6 md:mb-12 md:flex-row">
        <div className="text-center md:text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black tracking-widest text-blue-600 uppercase">
            <Sparkles className="h-3 w-3" />
            {isAdmin ? 'Admin Management' : 'Community Updates'}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {isAdmin ? 'Manage Announcements' : 'Recent Announcements'}
          </h1>
        </div>

        {isAdmin && (
          <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:gap-3">
            <button
              onClick={() => setIsPollModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-indigo-50 bg-white px-3 py-3 text-xs font-black text-indigo-600 shadow-sm transition-all hover:scale-[1.02] hover:border-indigo-100 hover:bg-indigo-50/50 hover:shadow-md active:scale-[0.98] sm:flex-initial sm:gap-2.5 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="whitespace-nowrap">Create Poll</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-3 text-xs font-black text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] hover:bg-black hover:shadow-gray-300 active:scale-[0.98] sm:flex-initial sm:gap-2.5 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="whitespace-nowrap">New Post</span>
            </button>
          </div>
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
