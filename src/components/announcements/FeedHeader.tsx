"use client";

import { useState } from "react";
import { Sparkles, Plus, BarChart3 } from "lucide-react";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import CreatePollModal from "../polls/CreatePollModal";

export default function FeedHeader({ user }: { user: any }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    return (
        <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12 max-w-2xl mx-auto w-full">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2">
                        <Sparkles className="h-3 w-3" />
                        {isAdmin ? "Admin Management" : "Community Updates"}
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isAdmin ? "Manage Announcements" : "Recent Announcements"}
                    </h1>
                </div>

                {isAdmin && (
                    <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setIsPollModalOpen(true)}
                            className="flex-1 sm:flex-initial px-3 sm:px-6 py-3 sm:py-3.5 bg-white text-indigo-600 border-2 border-indigo-50 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-indigo-50/50 hover:border-indigo-100 transition-all flex items-center justify-center gap-2 sm:gap-2.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="whitespace-nowrap">Create Poll</span>
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 sm:flex-initial px-3 sm:px-6 py-3 sm:py-3.5 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-black transition-all flex items-center justify-center gap-2 sm:gap-2.5 shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="whitespace-nowrap">New Post</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal is only even rendered for Admins */}
            {isAdmin && (
                <>
                    <CreateAnnouncementModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={() => window.location.reload()}
                        user={user}
                    />
                    <CreatePollModal
                        isOpen={isPollModalOpen}
                        onClose={() => setIsPollModalOpen(false)}
                        onSuccess={() => window.location.reload()}
                        user={user}
                    />
                </>
            )}
        </>
    );
}
