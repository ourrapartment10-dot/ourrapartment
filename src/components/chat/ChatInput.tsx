'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, AtSign, X, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string, replyToId?: string) => Promise<void>;
  replyingTo?: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  } | null;
  onCancelReply?: () => void;
}

const COMMON_EMOJIS = [
  {
    category: 'Reactions',
    emojis: ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👀'],
  },
  {
    category: 'Faces',
    emojis: [
      '😀',
      '😊',
      '🙂',
      '😉',
      '😍',
      '🥳',
      '😎',
      '🤔',
      '😐',
      '😴',
      '🤧',
      '😷',
    ],
  },
  {
    category: 'Hands',
    emojis: ['👋', '👌', '✌️', '🤞', '👏', '🤝', '🙏', '💪'],
  },
  {
    category: 'Objects',
    emojis: ['🏠', '🏢', '🚗', '💡', '📢', '📅', '💰', '🔧'],
  },
];

export default function ChatInput({ onSendMessage, replyingTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setShowEmojis(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setMessage(val);

    const textBeforeCursor = val.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    // Trigger on @ (length 1) or @name (length > 1)
    if (currentWord && currentWord.startsWith('@')) {
      const query = currentWord.substring(1);
      setMentionQuery(query);
      setShowMentions(true);
      setMentionIndex(0);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        try {
          // Send query even if empty
          const res = await fetch(`/api/users/search?q=${query}`);
          if (res.ok) {
            const users = await res.json();
            setMentionResults(users);
          }
        } catch (e) {
          console.error(e);
        }
      }, 300);
    } else {
      setShowMentions(false);
      setMentionResults([]);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const newMessage =
      message.substring(0, start) + emoji + message.substring(end);
    setMessage(newMessage);
    setShowEmojis(false);
    // Defer focus to allow UI update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          start + emoji.length,
          start + emoji.length
        );
      }
    }, 0);
  };

  const insertMention = (username: string) => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);

    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    const textBeforeMention = textBeforeCursor.slice(0, -currentWord.length);

    // Replace spaces and dots with underscores for the handle token
    const handle = username.replace(/[\s\.]+/g, '_');

    const newMessage = `${textBeforeMention}@${handle} ${textAfterCursor}`;
    setMessage(newMessage);
    setShowMentions(false);
    inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && mentionResults.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) =>
          Math.min(mentionResults.length - 1, prev + 1)
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[mentionIndex].name);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(message, replyingTo?.id);
      setMessage('');
      if (onCancelReply) onCancelReply(); // Clear reply state after sending
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative z-20 bg-white/50 p-4 backdrop-blur-md sm:p-6">
      {/* Reply Preview - Integrated more cleanly */}
      {replyingTo && (
        <div className="mx-auto mb-4 flex max-w-3xl items-center gap-3 animate-in slide-in-from-bottom-2 rounded-2xl border border-slate-200/60 bg-white/80 p-3 shadow-sm ring-1 ring-black/5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Reply className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-0.5">
              Replying to {replyingTo.sender.name}
            </p>
            <p className="text-[13px] text-slate-600 truncate italic">
              {replyingTo.content}
            </p>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="flex-shrink-0 rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Emoji Picker Popup - Simplified UI */}
      {showEmojis && (
        <div
          ref={emojiRef}
          className="animate-in zoom-in-95 absolute bottom-24 left-6 w-72 origin-bottom-left overflow-hidden rounded-[24px] border border-white bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl duration-200"
        >
          <div className="custom-scrollbar h-64 overflow-y-auto p-3">
            {COMMON_EMOJIS.map((cat, i) => (
              <div key={i} className="mb-4">
                <p className="mb-2 px-2 text-[10px] font-bold text-slate-400 uppercase">
                  {cat.category}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-all hover:bg-slate-100 hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Mention Suggestions */}
      {showMentions && mentionResults.length > 0 && (
        <div className="animate-in zoom-in-95 absolute bottom-24 left-16 z-30 w-64 overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
          <div className="p-2">
            {mentionResults.map((user, index) => (
              <button
                key={user.id}
                onClick={() => insertMention(user.name)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  index === mentionIndex ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"
                )}
                onMouseEnter={() => setMentionIndex(index)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold uppercase text-slate-500 overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.[0] || '@'
                  )}
                </div>
                <span className="text-sm font-bold truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[32px] border border-white bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 transition-all focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300',
            showEmojis ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
          )}
        >
          <Smile className="h-5.5 w-5.5" />
        </button>

        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="max-h-[140px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed font-semibold text-slate-800 placeholder:text-slate-400 outline-none scrollbar-hide"
          rows={1}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300',
            message.trim() && !sending
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-300'
          )}
        >
          <Send className={cn("h-5 w-5", message.trim() && "fill-white/20 ml-0.5")} />
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] font-bold text-slate-300/60 uppercase tracking-widest select-none">
        Press <span className="text-slate-400">Enter</span> to send
      </p>
    </div>
  );
}
