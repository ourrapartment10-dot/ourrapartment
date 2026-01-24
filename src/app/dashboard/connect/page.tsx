'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import NewChatModal from '@/components/chat/NewChatModal';
import { useAuth } from '@/components/auth/AuthContext';

interface Conversation {
  id: string;
  lastMessageAt: string;
  unreadCount?: number;
  participants: {
    id: string;
    name: string;
    image: string | null;
  }[];
  messages: {
    content: string;
    createdAt: string;
  }[];
}

export default function ConnectHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to load conversations', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchConversations();
  }, [user]);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] pb-20 sm:pb-0">
      {/* Header / Title */}
      {/* Header / Title */}
      <div className="relative px-2 pt-8 mb-8">
        <div className="max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex w-fit items-center gap-3 rounded-2xl bg-blue-50 px-4 py-2 text-blue-600"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Connect Space
            </span>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
            >
              Community <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Conversations.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
            >
              Join the general discussion, chat with neighbors, and stay connected.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top: Community Space CTA */}
        <div
          onClick={() => router.push('/dashboard/connect/community')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-1 shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/20"
        >
          <div className="relative flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-colors group-hover:bg-white/15">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 shadow-inner ring-4 ring-white/10 backdrop-blur-md">
              <Sparkles className="h-7 w-7 text-white fill-amber-300 drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Community Space</h2>
              <p className="text-sm font-medium text-blue-100 opacity-90">
                Join the general discussion with everyone
              </p>
            </div>
            <div className="mr-2 rounded-full bg-white/20 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* List of Conversations */}
        <div>
          <h3 className="mb-4 ml-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
            Messages
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-48 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <MessageSquare className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400">Start a conversation with a neighbor!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const lastMsg = conv.messages[0];
                return (
                  <div
                    key={conv.id}
                    onClick={() => router.push(`/dashboard/connect/${conv.id}`)}
                    className="group flex cursor-pointer items-center gap-4 rounded-2xl p-3 transition-all hover:bg-gray-50 active:scale-[0.98]"
                  >
                    {/* Avatar */}
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-full bg-gray-100 ring-2 ring-white shadow-sm group-hover:ring-blue-50">
                        {other.image ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={other.image.startsWith('http') ? other.image : `/${other.image.replace(/^\//, '')}`}
                            alt={other.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-lg">
                            {other.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Online status indicator could go here */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-[15px] text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {other.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                          {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className={`truncate text-sm ${(conv.unreadCount || 0) > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-500 group-hover:text-slate-600'}`}>
                          {lastMsg ? lastMsg.content : 'Started a conversation'}
                        </p>

                        {!!conv.unreadCount && conv.unreadCount > 0 && (
                          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-blue-200">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsNewChatOpen(true)}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 transition-all hover:scale-110 hover:bg-blue-700 active:scale-95 sm:bottom-8 sm:right-8 z-40"
      >
        <Plus className="h-7 w-7 text-white" />
      </button>

      {/* Mobile Nav Spacer is handled by layout bottom padding usually, but here handled by pb-20 */}

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
}
