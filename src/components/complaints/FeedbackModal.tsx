"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Star, MessageSquare, CheckCircle2, Sparkles } from "lucide-react";
import { submitComplaintFeedback } from "@/app/actions/complaints";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    complaintId: string;
}

export default function FeedbackModal({ isOpen, onClose, onSuccess, complaintId }: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await submitComplaintFeedback(complaintId, rating, feedback);
            onSuccess();
            onClose();
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
                        className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-xl z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-md bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] z-[110] overflow-hidden flex flex-col border border-white/20 max-h-[90vh]"
                    >
                        {/* High-End Header */}
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-200">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter leading-none mb-1">
                                        Service Quality
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        Rate Resolution
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors group">
                                <X className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
                            </button>
                        </div>

                        {/* Immersive Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10 bg-gradient-to-b from-white to-slate-50/30 font-medium">
                            <form id="feedback-form" onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                        How would you rate the experience?
                                    </label>
                                    <div className="flex gap-3 justify-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => { }}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-90"
                                            >
                                                <Star
                                                    className={cn(
                                                        "h-10 w-10 transition-colors duration-300",
                                                        star <= rating
                                                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                                            : "text-slate-100"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {rating > 0 && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]"
                                        >
                                            {rating === 5 ? "Exceptional Service" : rating === 4 ? "Great Experience" : rating === 3 ? "Satisfactory" : rating === 2 ? "Could be Better" : "Needs Improvement"}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        Additional Comments
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Any specific praise or suggestions?"
                                        rows={4}
                                        className="w-full px-8 py-6 bg-white border border-slate-100 rounded-[2rem] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all placeholder:text-slate-200 resize-none shadow-sm shadow-slate-100/50"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Glossy Footer */}
                        <div className="p-10 border-t border-slate-50 bg-white sticky bottom-0 z-30">
                            <button
                                type="submit"
                                form="feedback-form"
                                disabled={isSubmitting || rating === 0}
                                className="group/btn w-full relative h-16 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden hover:bg-black disabled:bg-slate-50 disabled:text-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] shadow-2xl shadow-slate-200"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            Submit Review
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
