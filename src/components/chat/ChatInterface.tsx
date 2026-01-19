'use client';

import { useEffect, useState, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import { useAuth } from '@/components/auth/AuthContext';
import { MessageSquare, Users, Sparkles, Hash } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: 'ADMIN' | 'SUPER_ADMIN' | 'RESIDENT' | 'USER';
    image?: string | null;
  };
}

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Initial Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchMessages();
  }, [user]);

  // 2. Pusher Subscription
  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe('connect-space');

    channel.bind('new-message', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      pusherClient.unsubscribe('connect-space');
    };
  }, [user]);

  // 3. Scroll to bottom
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      // Instant scroll on first load to prevent seeing old messages scroll by
      if (isFirstLoad.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        isFirstLoad.current = false;
      } else {
        // Smooth scroll for new messages
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
    } catch (error) {
      console.error('Failed to send', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="animate-pulse text-xs font-bold tracking-widest text-gray-400 uppercase">
            Connecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col rounded-none border-x-0 border-white/50 bg-white/50 shadow-none ring-0 ring-gray-900/5 backdrop-blur-3xl sm:rounded-[2.5rem] sm:border sm:shadow-2xl sm:ring-1 sm:shadow-blue-900/5">
      {/* Ambient Background Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-white/20" />

      {/* Header */}
      <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-gray-100/50 bg-white/80 px-4 py-3 backdrop-blur-md transition-all sm:flex sm:px-8 sm:py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300 sm:h-12 sm:w-12">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-gray-900">
              <span>Connect Space</span>
              <Sparkles className="h-4 w-4 fill-amber-400 text-amber-400" />
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <p className="text-xs font-medium text-gray-500">
                {messages.length} messages loaded
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 sm:flex">
          <Hash className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold tracking-wide text-gray-600 uppercase">
            General
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="custom-scrollbar relative z-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto scroll-smooth px-4 py-6 sm:px-8">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="animate-in zoom-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 duration-500">
              <Users className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Welcome to Connect Space!
            </h3>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500">
              This is the start of your community chat. Be the first to say
              hello to your neighbors! 👋
            </p>
          </div>
        ) : (
          <>
            <div className="py-4 text-center">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Earlier Messages
              </span>
            </div>
            {messages.map((msg, i) => {
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.sender.id === user?.id}
                />
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} className="h-4 sm:h-0" />
      </div>

      {/* Input Area */}
      <div className="relative z-20 flex-shrink-0 border-t border-gray-100 bg-white/80 p-2 backdrop-blur-lg sm:p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
