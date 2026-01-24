'use client';

import { useEffect, useState, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import { useAuth } from '@/components/auth/AuthContext';
import { MessageSquare, Users, Sparkles, Hash, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // Added cn import

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
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      image?: string | null;
    };
  } | null;
}

interface ChatInterfaceProps {
  apiEndpoint?: string;
  pusherChannel?: string;
  title?: string;
  subtitle?: string;
  image?: string | null;
  isCommunity?: boolean;
  onBack?: () => void;
}

export default function ChatInterface({
  apiEndpoint = '/api/chat',
  pusherChannel = 'connect-space',
  title = 'Connect Space',
  subtitle = 'Community Chat',
  image,
  isCommunity = true,
  onBack,
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. Fetch Initial Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(apiEndpoint);
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
  }, [user, apiEndpoint]);

  // 2. Pusher Subscription
  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe(pusherChannel);

    channel.bind('new-message', (newMessage: Message) => {
      setMessages((prev) => {
        // Dedup logic if needed, though usually pusher is ordered
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      pusherClient.unsubscribe(pusherChannel);
    };
  }, [user, pusherChannel]);

  // 3. Scroll to bottom
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      if (isFirstLoad.current && !isLoading) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        isFirstLoad.current = false;
      } else if (!isLoading) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, replyToId?: string) => {
    try {
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, replyToId }),
      });
    } catch (error) {
      console.error('Failed to send', error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
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
    <div className="relative flex h-full flex-col overflow-hidden bg-[#F8FAFC] sm:rounded-[2.5rem] sm:shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:ring-1 sm:ring-black/5">
      {/* Premium Ambient Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#E2E8F0_0%,transparent_30%),radial-gradient(circle_at_100%_100%,#F1F5F9_0%,transparent_30%)]" />

      {/* Modern Header - More compact */}
      <header className="relative z-10 flex items-center justify-between bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-4 border-b border-black/[0.03]">
        <div className="flex items-center gap-4">
          {/* Back Button - Clean Circle */}
          {(onBack || !isCommunity) && (
            <button
              onClick={onBack || (() => router.back())}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition-all hover:text-slate-900 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[14px] overflow-hidden text-white shadow-lg",
              isCommunity ? "bg-indigo-600 shadow-indigo-200" : "bg-blue-600 shadow-blue-200"
            )}>
              {isCommunity ? (
                <Sparkles className="h-5 w-5" />
              ) : image ? (
                <img
                  src={image.startsWith('http') ? image : `/${image.replace(/^\//, '')}`}
                  alt={title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-[15px] font-black text-white">
                  {title?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-[16px] font-black tracking-tight text-slate-900">
                {title}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <p className="text-[10px] font-black tracking-[0.1em] text-slate-500 uppercase">
                  {subtitle || 'Online'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isCommunity && (
          <div className="hidden items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 shadow-sm sm:flex">
            <Hash className="h-3 w-3 text-blue-500" />
            <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase">
              General Hub
            </span>
          </div>
        )}
      </header>

      {/* Messages Area - Added more padding and whitespace */}
      <div className="custom-scrollbar relative z-0 flex-1 space-y-10 overflow-y-auto px-4 py-10 sm:px-12">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white text-blue-500 shadow-xl shadow-blue-100/50 ring-1 ring-black/[0.02]">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
              Welcome aboard!
            </h3>
            <p className="mx-auto max-w-[240px] text-[15px] font-semibold leading-relaxed text-slate-400">
              {isCommunity
                ? "This is the start of your community hub. Say hi to your neighbors!"
                : "Your private conversation begins here."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                Earlier Discussion
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
            </div>
            {messages.map((msg, i) => {
              const isMe = msg.sender.id === user?.id;
              const isSequence = i > 0 && messages[i - 1].sender.id === msg.sender.id;

              return (
                <div key={msg.id} className={cn(isSequence ? '-mt-6' : '', "animate-in fade-in duration-700")}>
                  <MessageBubble
                    message={msg}
                    isMe={isMe}
                    onReply={handleReply}
                  />
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {/* Input Area - Pure glassmorphism */}
      <ChatInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          sender: {
            name: replyingTo.sender.name
          }
        } : null}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
}
