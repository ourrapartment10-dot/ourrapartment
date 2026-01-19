
"use client";

import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useAuth } from "@/components/auth/AuthContext";
import { MessageSquare, Users, Sparkles, Hash } from "lucide-react";

interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: "ADMIN" | "SUPER_ADMIN" | "RESIDENT" | "USER";
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
                const res = await fetch("/api/chat");
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Failed to load messages", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchMessages();
    }, [user]);

    // 2. Pusher Subscription
    useEffect(() => {
        if (!user) return;

        const channel = pusherClient.subscribe("connect-space");

        channel.bind("new-message", (newMessage: Message) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            pusherClient.unsubscribe("connect-space");
        };
    }, [user]);

    // 3. Scroll to bottom
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (messagesEndRef.current) {
            // Instant scroll on first load to prevent seeing old messages scroll by
            if (isFirstLoad.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
                isFirstLoad.current = false;
            } else {
                // Smooth scroll for new messages
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (text: string) => {
        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 h-full bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Connecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-3xl rounded-none sm:rounded-[2.5rem] border-x-0 sm:border border-white/50 shadow-none sm:shadow-2xl sm:shadow-blue-900/5 ring-0 sm:ring-1 ring-gray-900/5 relative">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-white/20 pointer-events-none" />

            {/* Header */}
            <header className="hidden sm:flex px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-300">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span>Connect Space</span>
                            <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <p className="text-xs text-gray-500 font-medium">{messages.length} messages loaded</p>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">General</span>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 space-y-6 scroll-smooth custom-scrollbar relative z-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <Users className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Connect Space!</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                            This is the start of your community chat. Be the first to say hello to your neighbors! 👋
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center py-4">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
            <div className="flex-shrink-0 p-2 sm:p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 relative z-20">
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
