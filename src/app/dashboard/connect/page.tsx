'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { Users, Info } from 'lucide-react';

export default function ConnectSpacePage() {
  return (
    <div className="animate-in fade-in flex h-[calc(100dvh-5rem)] min-h-[400px] flex-col gap-6 overflow-hidden duration-500 lg:h-[calc(100vh-8rem)] lg:flex-row">
      {/* Main Chat Area - Flexible width */}
      <div className="min-w-0 flex-1">
        <ChatInterface />
      </div>

      {/* Sidebar Guidelines (Hidden on mobile) */}
      <div className="hidden w-80 flex-col gap-6 lg:flex">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
          <h3 className="mb-2 text-lg font-bold">Community Guidelines</h3>
          <p className="mb-4 text-sm leading-relaxed text-indigo-100 opacity-90">
            Welcome to the Connect Space! This is a shared space for all
            residents.
          </p>
          <ul className="space-y-3 text-sm text-indigo-50">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
              Be respectful and kind to neighbors.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
              Avoid spamming or strictly commercial posts.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
              Report issues via the Complaints tab, not here.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Info className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-gray-900">Tips</h4>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            Type{' '}
            <span className="rounded border border-gray-200 bg-gray-100 px-1 py-0.5 font-mono text-xs">
              @
            </span>{' '}
            to mention a neighbor or admin directly. They will receive a
            notification.
          </p>
          <p className="text-sm text-gray-500">
            Messages are visible to all verified residents of the community.
          </p>
        </div>
      </div>
    </div>
  );
}
