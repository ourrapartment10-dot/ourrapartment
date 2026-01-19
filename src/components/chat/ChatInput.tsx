
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, AtSign, X } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => Promise<void>;
}

const COMMON_EMOJIS = [
    { category: "Reactions", emojis: ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀"] },
    { category: "Faces", emojis: ["😀", "😊", "🙂", "😉", "😍", "🥳", "😎", "🤔", "😐", "😴", "🤧", "😷"] },
    { category: "Hands", emojis: ["👋", "👌", "✌️", "🤞", "👏", "🤝", "🙏", "💪"] },
    { category: "Objects", emojis: ["🏠", "🏢", "🚗", "💡", "📢", "📅", "💰", "🔧"] }
];

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [mentionIndex, setMentionIndex] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Click outside to close emoji picker
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmojis(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
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
        if (currentWord && currentWord.startsWith("@")) {
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
                } catch (e) { console.error(e); }
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
        const newMessage = message.substring(0, start) + emoji + message.substring(end);
        setMessage(newMessage);
        setShowEmojis(false);
        // Defer focus to allow UI update
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
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

        const newMessage = `${textBeforeMention}@${username} ${textAfterCursor}`;
        setMessage(newMessage);
        setShowMentions(false);
        inputRef.current.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showMentions && mentionResults.length > 0) {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setMentionIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setMentionIndex(prev => Math.min(mentionResults.length - 1, prev + 1));
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertMention(mentionResults[mentionIndex].name);
            } else if (e.key === "Escape") {
                setShowMentions(false);
            }
            return;
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if (!message.trim() || sending) return;

        setSending(true);
        try {
            await onSendMessage(message);
            setMessage("");
            if (inputRef.current) inputRef.current.style.height = 'auto';
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative p-2.5 sm:p-4 bg-white border-t border-gray-100 z-20">
            {/* Emoji Picker Popup */}
            {showEmojis && (
                <div ref={emojiRef} className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 w-72 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-left">
                    <div className="p-3 h-10 border-b border-gray-100/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emoji</span>
                        <button onClick={() => setShowEmojis(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="h-64 overflow-y-auto p-2 custom-scrollbar">
                        {COMMON_EMOJIS.map((cat, i) => (
                            <div key={i} className="mb-4">
                                <p className="px-2 text-[10px] font-bold text-gray-400 mb-2 uppercase">{cat.category}</p>
                                <div className="grid grid-cols-6 gap-1">
                                    {cat.emojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => insertEmoji(emoji)}
                                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-black/5 rounded-lg transition-colors"
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

            {/* Mention List Popup */}
            {showMentions && mentionResults.length > 0 && (
                <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 w-72 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 ring-1 ring-black/5 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    <p className="px-4 py-2 text-[10px] font-bold text-gray-500 bg-gray-50/50 uppercase tracking-wider flex items-center gap-2">
                        <AtSign className="h-3 w-3" /> Suggestion
                    </p>
                    <ul className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                        {mentionResults.map((user, i) => (
                            <li
                                key={user.id}
                                className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${i === mentionIndex ? "bg-blue-50/80" : "hover:bg-gray-50"}`}
                                onClick={() => insertMention(user.name)}
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm border border-white overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name[0]
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900 leading-none">{user.name}</span>
                                    {user.role !== "RESIDENT" && (
                                        <span className="text-[10px] font-semibold text-blue-600 mt-1">{user.role}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="relative flex items-end gap-2 bg-gray-50/80 p-1 rounded-2xl sm:rounded-[1.5rem] border border-gray-200 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all duration-300 shadow-sm">
                <button
                    onClick={() => setShowEmojis(!showEmojis)}
                    className={`p-2.5 rounded-full transition-colors hidden sm:block ${showEmojis ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                    <Smile className="h-5 w-5" />
                </button>

                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-[120px] min-h-[38px] py-2.5 px-3 sm:px-0 text-sm text-gray-700 placeholder:text-gray-400 font-medium leading-relaxed"
                    rows={1}
                />

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="p-2.5 sm:p-3 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
                >
                    <Send className="h-4 w-4 fill-current" />
                </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 text-center select-none hidden">
                Press <strong>Enter</strong> to send
            </p>
        </div>
    );
}
