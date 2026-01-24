'use client';

import { cn } from '@/lib/utils';
import { UserRole } from '@/generated/client';
import { Reply } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      image?: string | null;
      role: UserRole;
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
  };
  isMe: boolean;
  onReply?: (message: any) => void;
}

export default function MessageBubble({ message, isMe, onReply }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'group relative mb-6 flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500',
        isMe ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[85%] gap-2.5 md:max-w-[70%]',
          isMe ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar - Smaller and cleaner */}
        {!isMe && (
          <div className="flex-shrink-0 self-start mt-1">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm transition-transform group-hover:scale-105">
              {message.sender.image ? (
                <img
                  referrerPolicy="no-referrer"
                  src={message.sender.image.startsWith('http') ? message.sender.image : `/${message.sender.image.replace(/^\//, '')}`}
                  alt={message.sender.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-bold text-slate-400">
                  {message.sender.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bubble Container */}
        <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
          {!isMe && (
            <span className="mb-1 ml-1 text-[11px] font-black tracking-tight text-slate-600">
              {message.sender.name}
            </span>
          )}

          <div
            className={cn(
              'relative transition-all duration-300',
              isMe ? 'items-end' : 'items-start'
            )}
          >
            {/* Main Bubble */}
            <div
              className={cn(
                'relative overflow-hidden rounded-[24px] px-5 py-3.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] ring-1 ring-black/5',
                isMe
                  ? 'bg-[#CBD5E1] text-slate-950 font-bold' // More contrast for "me"
                  : 'bg-white text-slate-900' // High contrast for others
              )}
            >
              {/* Reply Preview inside Bubble */}
              {message.replyTo && (
                <div
                  className={cn(
                    'mb-3 space-y-0.5 rounded-xl border-l-[3px] py-1.5 pl-3',
                    isMe
                      ? 'border-slate-400 bg-white/50'
                      : 'border-blue-500/50 bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-700">
                    <Reply className="h-3 w-3 opacity-80" />
                    {message.replyTo.sender.name}
                  </div>
                  <p className="line-clamp-1 text-[12px] leading-relaxed text-slate-600 font-bold italic">
                    {message.replyTo.content}
                  </p>
                </div>
              )}

              {/* Message Content */}
              <p className="text-[14.5px] leading-[1.6] font-semibold tracking-tight whitespace-pre-wrap break-words">
                {message.content.split(/(@[\w\._-]+)/g).map((part, i) =>
                  part.startsWith('@') ? (
                    <span key={i} className="font-black text-blue-700 cursor-pointer hover:underline">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>

            {/* Hover Actions - Cleanly positioned */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 opacity-0 transition-opacity group-hover:opacity-100',
                isMe ? '-left-20 flex-row-reverse' : '-right-20'
              )}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-50 hover:text-blue-500 hover:shadow-md"
                >
                  <Reply className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Time & Role Footer */}
          <div className={cn(
            'mt-1.5 flex items-center gap-2 px-2',
            isMe ? 'flex-row-reverse' : 'flex-row'
          )}>
            <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
              {formattedTime}
            </span>
            {!isMe && message.sender.role !== 'RESIDENT' && (
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-700">
                {message.sender.role}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
