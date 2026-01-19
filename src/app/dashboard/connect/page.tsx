
"use client";

import ChatInterface from "@/components/chat/ChatInterface";
import { Users, Info } from "lucide-react";

export default function ConnectSpacePage() {
    return (
        <div className="h-[calc(100dvh-5rem)] lg:h-[calc(100vh-8rem)] min-h-[400px] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Main Chat Area - Flexible width */}
            <div className="flex-1 min-w-0">
                <ChatInterface />
            </div>

            {/* Sidebar Guidelines (Hidden on mobile) */}
            <div className="w-80 hidden lg:flex flex-col gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Community Guidelines</h3>
                    <p className="text-sm text-indigo-100 opacity-90 leading-relaxed mb-4">
                        Welcome to the Connect Space! This is a shared space for all residents.
                    </p>
                    <ul className="space-y-3 text-sm text-indigo-50">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                            Be respectful and kind to neighbors.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                            Avoid spamming or strictly commercial posts.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                            Report issues via the Complaints tab, not here.
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Info className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-gray-900">Tips</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                        Type <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded border border-gray-200">@</span> to mention a neighbor or admin directly. They will receive a notification.
                    </p>
                    <p className="text-sm text-gray-500">
                        Messages are visible to all verified residents of the community.
                    </p>
                </div>
            </div>
        </div>
    );
}
