'use client';

import { cn } from '@/lib/utils';
import { UserRole } from '@/generated/client';

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
  };
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'group animate-in slide-in-from-bottom-2 relative mb-6 flex w-full duration-300',
        isMe ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[85%] gap-3 md:max-w-[65%]',
          isMe ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        {!isMe && (
          <div className="mb-1 flex-shrink-0 self-end">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[10px] font-bold text-gray-600 shadow-sm ring-2 ring-white">
              {message.sender.image ? (
                <img
                  src={message.sender.image}
                  alt={message.sender.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                message.sender.name?.[0]?.toUpperCase()
              )}
            </div>
          </div>
        )}

        {/* Bubble Container */}
        <div
          className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
        >
          {!isMe && (
            <div className="mb-1 flex items-center gap-2 px-1">
              <span className="text-[11px] font-bold text-gray-600">
                {message.sender.name}
              </span>
              {message.sender.role !== 'RESIDENT' &&
                message.sender.role !== 'USER' && (
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-600 uppercase">
                    {message.sender.role}
                  </span>
                )}
            </div>
          )}

          <div
            className={cn(
              'relative overflow-hidden rounded-[1.25rem] px-5 py-3 text-sm leading-relaxed shadow-sm transition-all',
              isMe
                ? 'rounded-br-none bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200'
                : 'rounded-bl-none border border-gray-100 bg-white text-gray-800 shadow-sm'
            )}
          >
            {/* Glow effect for "Me" bubbles */}
            {isMe && (
              <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            )}

            <p className="relative z-10 font-medium break-words whitespace-pre-wrap">
              {/* Highlight mentions safely */}
              {message.content.split(/(@\w+)/g).map((part, i) =>
                part.startsWith('@') ? (
                  <span
                    key={i}
                    className={
                      isMe
                        ? 'rounded bg-white/20 px-1 font-bold'
                        : 'rounded bg-blue-50 px-1 font-bold text-blue-600'
                    }
                  >
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
            </p>
          </div>

          <span
            className={cn(
              'mt-1.5 px-1 text-[10px] font-medium text-gray-400 opacity-0 transition-opacity group-hover:opacity-100',
              isMe ? 'text-right' : 'text-left'
            )}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
