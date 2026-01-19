"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Send, Loader2, Plus, Trash2, BarChart3, Eye, Edit3, MessageCircle, Heart, Pin, Calendar, Timer, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useS3Upload } from "@/hooks/useS3";
import { validateFile } from "@/lib/s3-utils";
import S3Image from "@/components/common/S3Image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CreateAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: any;
    editData?: {
        id: string;
        title: string;
        content: string;
        imageUrl?: string | null;
        commentsEnabled: boolean;
        expiresAt?: string | null;
        poll?: any;
    } | null;
}

export default function CreateAnnouncementModal({ isOpen, onClose, onSuccess, editData, user }: CreateAnnouncementModalProps) {
    const formatDateForInput = (dateVal: string | Date | null | undefined) => {
        if (!dateVal) return "";
        try {
            const date = new Date(dateVal);
            if (!isNaN(date.getTime())) {
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                return localDate.toISOString().substring(0, 16);
            }
        } catch (e) {
            console.error("Error formatting date:", e);
        }
        return "";
    };

    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [title, setTitle] = useState(editData?.title || "");
    const [content, setContent] = useState(editData?.content || "");
    const [commentsEnabled, setCommentsEnabled] = useState(editData?.commentsEnabled ?? true);
    const [expiresAt, setExpiresAt] = useState(formatDateForInput(editData?.expiresAt));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Poll State
    const [hasPoll, setHasPoll] = useState(!!editData?.poll);
    const [pollQuestion, setPollQuestion] = useState(editData?.poll?.question || "");
    const [pollOptions, setPollOptions] = useState<string[]>(
        editData?.poll?.options?.map((o: any) => o.text) || ["", ""]
    );

    // Use S3 upload hook
    const { upload, uploading, uploadedUrl, reset: resetUpload, setUrl } = useS3Upload("announcement-attachments");

    // Sync state when editData changes
    useEffect(() => {
        if (editData) {
            setTitle(editData.title);
            setContent(editData.content);
            setCommentsEnabled(editData.commentsEnabled);
            setExpiresAt(formatDateForInput(editData.expiresAt));
            setHasPoll(!!editData.poll);
            setPollQuestion(editData.poll?.question || "");
            setPollOptions(editData.poll?.options?.map((o: any) => o.text) || ["", ""]);

            if (editData.imageUrl) {
                setUrl(editData.imageUrl);
            } else {
                resetUpload();
            }
        } else if (isOpen) {
            setTitle("");
            setContent("");
            setCommentsEnabled(true);
            setExpiresAt("");
            setHasPoll(false);
            setPollQuestion("");
            setPollOptions(["", ""]);
            resetUpload();
        }
    }, [editData, isOpen, setUrl, resetUpload]);

    const isEditing = !!editData;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file, {
            maxSizeMB: 5,
            allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/jfif"]
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        await upload(file);
    };

    const addPollOption = () => {
        if (pollOptions.length < 10) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        // Validate poll if enabled
        const filteredPollOptions = pollOptions.filter(opt => opt.trim() !== "");
        if (hasPoll && (!pollQuestion || filteredPollOptions.length < 2)) {
            setError("Please provide a poll question and at least 2 options.");
            return;
        }

        setIsSubmitting(true);
        try {
            const url = isEditing
                ? `/api/announcements/${editData.id}`
                : "/api/announcements";

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl: uploadedUrl,
                    commentsEnabled,
                    expiresAt: expiresAt || null,
                    poll: hasPoll ? {
                        question: pollQuestion,
                        options: filteredPollOptions,
                        isAnonymous: false, // Default for integrated polls
                    } : null
                })
            });

            if (res.ok) {
                if (!isEditing) {
                    setTitle("");
                    setContent("");
                    setCommentsEnabled(true);
                    setExpiresAt("");
                    resetUpload();
                }
                onSuccess?.();
                onClose();
            } else {
                setError(`Failed to ${isEditing ? 'update' : 'create'} announcement.`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-6xl h-[90vh] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Custom Header */}
                        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                                        {isEditing ? 'Refine Post' : 'Compose Update'}
                                    </h2>
                                    <p className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        Broadcasting to all
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group sm:hidden">
                                    <X className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100/50 p-1 rounded-xl sm:rounded-2xl w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveTab("edit")}
                                    className={cn(
                                        "flex-1 sm:flex-initial px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5",
                                        activeTab === "edit" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Editor
                                </button>
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={cn(
                                        "flex-1 sm:flex-initial px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5",
                                        activeTab === "preview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Live Preview
                                </button>
                            </div>

                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group hidden sm:block">
                                <X className="h-6 w-6 text-gray-400 group-hover:text-gray-900" />
                            </button>
                        </div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-8 overflow-hidden"
                                >
                                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-600">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="text-sm font-bold">{error}</span>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Body */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Editor Pane */}
                            <div className={cn(
                                "flex-1 overflow-y-auto custom-scrollbar p-8 bg-white transition-all duration-500",
                                activeTab === "preview" && "hidden lg:block opacity-40 grayscale pointer-events-none scale-95"
                            )}>
                                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
                                    {/* Essentials */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 block">Headline Content</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="What's the update about?"
                                                className="w-full px-0 py-2 sm:py-4 bg-transparent border-b-2 border-gray-100 font-bold text-2xl sm:text-3xl text-gray-900 focus:border-blue-600 outline-none transition-all placeholder:text-gray-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 block">Detailed Message</label>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Write your announcement here..."
                                                rows={5}
                                                className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-3xl font-medium text-base sm:text-lg text-gray-900 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Visual Attachment */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Visual Attachment</label>
                                            <div className="aspect-video relative rounded-3xl border-2 border-dashed border-gray-100 overflow-hidden group hover:border-blue-400 transition-all">
                                                {!uploadedUrl ? (
                                                    <div
                                                        onClick={() => document.getElementById('post-file-input')?.click()}
                                                        className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-colors"
                                                    >
                                                        {uploading ? (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                                                <p className="font-black text-xs text-blue-600 animate-pulse">Uploading...</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                                <p className="font-bold text-sm text-gray-400">Click to upload image</p>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full group">
                                                        <S3Image src={uploadedUrl} alt="Preview" className="w-full h-full object-cover" containerClassName="h-full" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={resetUpload}
                                                                className="px-6 py-3 bg-white text-red-600 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Replace
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <input id="post-file-input" type="file" hidden accept="image/*" onChange={handleFileSelect} />
                                            </div>
                                        </div>

                                        {/* Settings */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Settings & Flow</label>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-bold">Auto-Expiration</span>
                                                    </div>
                                                    <input
                                                        type="datetime-local"
                                                        value={expiresAt}
                                                        onChange={(e) => setExpiresAt(e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-900 focus:border-blue-600 outline-none transition-all"
                                                    />
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Post will be hidden after this time</p>
                                                </div>

                                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MessageCircle className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-bold">Resident Replies</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCommentsEnabled(!commentsEnabled)}
                                                            className={cn(
                                                                "w-12 h-6 rounded-full p-1 transition-all relative",
                                                                commentsEnabled ? "bg-blue-600" : "bg-gray-300"
                                                            )}
                                                        >
                                                            <div className={cn("h-4 w-4 bg-white rounded-full transition-transform", commentsEnabled ? "translate-x-6" : "translate-x-0")} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Allow comments on this post</p>
                                                </div>

                                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <BarChart3 className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-bold">Attach Poll</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setHasPoll(!hasPoll)}
                                                            className={cn(
                                                                "w-12 h-6 rounded-full p-1 transition-all relative",
                                                                hasPoll ? "bg-indigo-600" : "bg-gray-300"
                                                            )}
                                                        >
                                                            <div className={cn("h-4 w-4 bg-white rounded-full transition-transform", hasPoll ? "translate-x-6" : "translate-x-0")} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Add an interactive poll</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Poll Editor Section */}
                                    <AnimatePresence>
                                        {hasPoll && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, y: 20 }}
                                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: 20 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-6">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                                                            <BarChart3 className="h-5 w-5 text-white" />
                                                        </div>
                                                        <h3 className="font-black text-indigo-900 tracking-tight">Poll Configuration</h3>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">The Big Question</label>
                                                            <input
                                                                type="text"
                                                                value={pollQuestion}
                                                                onChange={(e) => setPollQuestion(e.target.value)}
                                                                placeholder="e.g. Which date works best for all?"
                                                                className="w-full px-0 py-3 bg-transparent border-b-2 border-indigo-200 font-bold text-xl text-indigo-900 focus:border-indigo-600 outline-none transition-all placeholder:text-indigo-200"
                                                            />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Response Options</label>
                                                            {pollOptions.map((opt, idx) => (
                                                                <div key={idx} className="flex gap-2">
                                                                    <div className="flex-1 relative">
                                                                        <input
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                                                            placeholder={`Choice ${idx + 1}`}
                                                                            className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                                                                        />
                                                                        <span className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300">{idx + 1}</span>
                                                                    </div>
                                                                    {pollOptions.length > 2 && (
                                                                        <button type="button" onClick={() => removePollOption(idx)} className="p-3 text-indigo-300 hover:text-red-500 transition-colors">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {pollOptions.length < 10 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={addPollOption}
                                                                    className="w-full py-3 bg-indigo-100/50 rounded-2xl text-xs font-black text-indigo-600 border border-indigo-200 border-dashed hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                    Add Better Choice
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>

                            {/* Preview Pane */}
                            <div className={cn(
                                "flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 lg:flex items-center justify-center p-8 lg:p-12 transition-all duration-700",
                                activeTab === "edit" ? "hidden" : "flex"
                            )}>
                                <div className="w-full max-w-md">
                                    <div className="text-center mb-10">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Live Rendering</span>
                                    </div>

                                    {/* Mock Post Card */}
                                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden scale-110 lg:scale-125 transform-gpu">
                                        {/* Header */}
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden relative border border-blue-50">
                                                {user?.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-xs">{user?.name?.[0] || 'A'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-xs font-bold text-gray-900">{user?.name || "Admin Name"}</h4>
                                                    <span className="bg-blue-100 text-blue-600 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Admin</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-400 font-medium">Just now</p>
                                                    {expiresAt && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-tighter">
                                                            <Timer className="h-2 w-2" />
                                                            Expires soon
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Media */}
                                        {uploadedUrl ? (
                                            <div className="aspect-video relative overflow-hidden bg-gray-50">
                                                <S3Image src={uploadedUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                                        )}

                                        {/* Body */}
                                        <div className="p-5">
                                            <h3 className="font-black text-gray-900 mb-1.5 leading-tight">{title || "Your Epic Title Here"}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">{content || "Share something amazing with the community..."}</p>
                                        </div>

                                        {/* Mock Poll */}
                                        {hasPoll && (
                                            <div className="px-5 pb-5">
                                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                                                    <h4 className="text-[10px] font-black text-indigo-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <BarChart3 className="h-3 w-3" />
                                                        {pollQuestion || "The Poll Question"}
                                                    </h4>
                                                    <div className="space-y-1.5">
                                                        {pollOptions.map((opt, idx) => opt.trim() && (
                                                            <div key={idx} className="w-full py-2 px-3 bg-white rounded-lg border border-indigo-100 text-[10px] font-bold text-indigo-700">
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactions */}
                                        <div className="px-5 pb-4 flex items-center gap-3">
                                            <Heart className="h-6 w-6 text-gray-300" />
                                            <MessageCircle className="h-6 w-6 text-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button
                                onClick={onClose}
                                className="hidden sm:block text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                            >
                                Discard draft
                            </button>

                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                {activeTab === "preview" && (
                                    <button
                                        onClick={() => setActiveTab("edit")}
                                        className="flex-1 sm:flex-initial px-6 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl sm:rounded-2xl font-black text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        Back to Editor
                                    </button>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!title || !content || uploading || isSubmitting}
                                    className="flex-1 sm:flex-initial px-6 sm:px-10 py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>{isEditing ? 'Syncing...' : 'Publishing...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            <span>{isEditing ? 'Save' : 'Publish'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
