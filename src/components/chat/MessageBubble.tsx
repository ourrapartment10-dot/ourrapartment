
"use client";

import { cn } from "@/lib/utils";
import { UserRole } from "@/generated/client";

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
    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={cn("flex w-full mb-6 relative group animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[85%] md:max-w-[65%] gap-3", isMe ? "flex-row-reverse" : "flex-row")}>

                {/* Avatar */}
                {!isMe && (
                    <div className="flex-shrink-0 self-end mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm overflow-hidden text-gray-600">
                            {message.sender.image ? (
                                <img src={message.sender.image} alt={message.sender.name} className="w-full h-full object-cover" />
                            ) : (
                                message.sender.name?.[0]?.toUpperCase()
                            )}
                        </div>
                    </div>
                )}

                {/* Bubble Container */}
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    {!isMe && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] font-bold text-gray-600">
                                {message.sender.name}
                            </span>
                            {message.sender.role !== "RESIDENT" && message.sender.role !== "USER" && (
                                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider border border-indigo-100">
                                    {message.sender.role}
                                </span>
                            )}
                        </div>
                    )}

                    <div className={cn("px-5 py-3 rounded-[1.25rem] text-sm leading-relaxed shadow-sm transition-all relative overflow-hidden",
                        isMe
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-200"
                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                    )}>
                        {/* Glow effect for "Me" bubbles */}
                        {isMe && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />}

                        <p className="whitespace-pre-wrap break-words relative z-10 font-medium">
                            {/* Highlight mentions safely */}
                            {message.content.split(/(@\w+)/g).map((part, i) => (
                                part.startsWith('@') ? <span key={i} className={isMe ? "bg-white/20 px-1 rounded font-bold" : "text-blue-600 font-bold bg-blue-50 px-1 rounded"}>{part}</span> : part
                            ))}
                        </p>
                    </div>

                    <span className={cn("text-[10px] text-gray-400 mt-1.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity px-1", isMe ? "text-right" : "text-left")}>
                        {formattedTime}
                    </span>
                </div>
            </div>
        </div>
    );
}
