"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, Loader2, Info, BarChart3, Edit3, Eye, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreatePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: any;
    editData?: any;
    announcementId?: string | null;
}

export default function CreatePollModal({ isOpen, onClose, onSuccess, user, editData, announcementId }: CreatePollModalProps) {
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [endsAt, setEndsAt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editData) {
            setQuestion(editData.question);
            setDescription(editData.description || "");
            setOptions(editData.options.map((opt: any) => opt.text));
            setIsAnonymous(editData.isAnonymous);
            setEndsAt(editData.endsAt ? editData.endsAt.substring(0, 16) : "");
        } else if (isOpen) {
            resetForm();
        }
    }, [editData, isOpen]);

    const resetForm = () => {
        setQuestion("");
        setDescription("");
        setOptions(["", ""]);
        setIsAnonymous(false);
        setEndsAt("");
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredOptions = options.filter(opt => opt.trim() !== "");
        if (!question || filteredOptions.length < 2) return;

        setIsSubmitting(true);
        try {
            const url = editData ? `/api/polls/${editData.id}` : "/api/polls";
            const method = editData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    description,
                    options: filteredOptions,
                    isAnonymous,
                    endsAt: endsAt || null,
                    announcementId
                })
            });

            if (res.ok) {
                onSuccess?.();
                onClose();
            } else {
                setError("Failed to save poll");
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Header */}
                        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                                        {editData ? "Refine Poll" : "Launch Sentiment Poll"}
                                    </h2>
                                    <p className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        Gathering community insights
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
                                        activeTab === "edit" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Configure
                                </button>
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={cn(
                                        "flex-1 sm:flex-initial px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5",
                                        activeTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Vibe Check
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
                                            <Info className="h-5 w-5" />
                                            <span className="text-sm font-bold">{error}</span>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Editor */}
                            <div className={cn(
                                "flex-1 overflow-y-auto custom-scrollbar p-8 bg-white transition-all duration-500",
                                activeTab === "preview" && "hidden lg:block opacity-40 grayscale pointer-events-none scale-95"
                            )}>
                                <form id="standalone-poll-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 block">Poll Question</label>
                                            <input
                                                type="text"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                placeholder="What is your question?"
                                                className="w-full px-0 py-2 sm:py-4 bg-transparent border-b-2 border-gray-100 font-bold text-xl sm:text-2xl text-gray-900 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-200"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 block">Contextual Details</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Add context..."
                                                rows={3}
                                                className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-3xl font-medium text-base sm:text-lg text-gray-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Voting Options</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {options.map((option, index) => (
                                                <div key={index} className="flex gap-2 items-center group">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                            placeholder={`Choice ${index + 1}`}
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:border-indigo-600 outline-none transition-all pl-12 shadow-sm focus:shadow-md"
                                                            required
                                                        />
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-300">{index + 1}</span>
                                                    </div>
                                                    {options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {options.length < 10 && (
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-sm font-black text-indigo-400 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Add New Perspective
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Expiration Time</span>
                                            </div>
                                            <input
                                                type="datetime-local"
                                                value={endsAt}
                                                onChange={(e) => setEndsAt(e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm text-gray-900 focus:border-indigo-600 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 flex items-center justify-between">
                                            <div>
                                                <span className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Privacy Grade</span>
                                                <span className="block text-xs text-gray-400 font-bold">Anonymous Voting</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsAnonymous(!isAnonymous)}
                                                className={cn(
                                                    "w-14 h-7 rounded-full p-1 transition-all relative",
                                                    isAnonymous ? "bg-indigo-600" : "bg-gray-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 bg-white rounded-full shadow-lg transition-transform",
                                                    isAnonymous ? "translate-x-7" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Preview */}
                            <div className={cn(
                                "flex-1 overflow-y-auto custom-scrollbar bg-indigo-50/30 lg:flex items-center justify-center p-8 lg:p-12 transition-all duration-700",
                                activeTab === "edit" ? "hidden" : "flex"
                            )}>
                                <div className="w-full max-w-md">
                                    <div className="text-center mb-8">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                            <Sparkles className="h-3 w-3" />
                                            Live Sentiment View
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden scale-110 transform-gpu p-8 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 leading-tight">{question || "Question Placeholder"}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Live Poll</span>
                                                        {isAnonymous && (
                                                            <span className="bg-gray-100 text-gray-500 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Anonymous</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {description && (
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic">{description}</p>
                                        )}

                                        <div className="space-y-2">
                                            {options.map((opt, idx) => opt.trim() && (
                                                <div key={idx} className="w-full py-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black text-gray-700 flex justify-between items-center group">
                                                    <span>{opt}</span>
                                                    <div className="h-4 w-4 rounded-full border-2 border-indigo-200 group-hover:border-indigo-600 transition-colors" />
                                                </div>
                                            ))}
                                            <div className="pt-4 flex items-center justify-between text-gray-400">
                                                <span className="text-[10px] font-black uppercase tracking-widest">0 Votes cast</span>
                                                {endsAt && <span className="text-[10px] font-bold">Ends soon</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                                        className="flex-1 sm:flex-initial px-6 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl sm:rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        Config Adjust
                                    </button>
                                )}

                                <button
                                    form="standalone-poll-form"
                                    type="submit"
                                    disabled={!question || options.filter(o => o.trim() !== "").length < 2 || isSubmitting}
                                    className="flex-1 sm:flex-initial px-6 sm:px-10 py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Launching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            <span>{editData ? "Update" : "Launch"}</span>
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
