'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  X,
  Star,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { submitComplaintFeedback } from '@/app/actions/complaints';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  complaintId: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSuccess,
  complaintId,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
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
            className="fixed inset-0 z-[100] h-screen w-screen bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 z-[110] flex max-h-[90vh] w-[98%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[3rem] border border-white/20 bg-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)]"
          >
            {/* High-End Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-50 bg-white px-10 py-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-xl shadow-amber-200">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="mb-1 text-2xl leading-none font-[900] tracking-tighter text-slate-900">
                    Service Quality
                  </h2>
                  <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    Rate Resolution
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group rounded-full p-3 transition-colors hover:bg-slate-50"
              >
                <X className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
              </button>
            </div>

            {/* Immersive Content */}
            <div className="custom-scrollbar flex-1 space-y-10 overflow-y-auto bg-gradient-to-b from-white to-slate-50/30 p-10 font-medium">
              <form
                id="feedback-form"
                onSubmit={handleSubmit}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <label className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    How would you rate the experience?
                  </label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => {}}
                        onClick={() => setRating(star)}
                        className="p-1 transition-all duration-300 hover:-translate-y-1 hover:scale-125 active:scale-90"
                      >
                        <Star
                          className={cn(
                            'h-10 w-10 transition-colors duration-300',
                            star <= rating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                              : 'text-slate-100'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-[10px] font-black tracking-[0.2em] text-amber-600 uppercase"
                    >
                      {rating === 5
                        ? 'Exceptional Service'
                        : rating === 4
                          ? 'Great Experience'
                          : rating === 3
                            ? 'Satisfactory'
                            : rating === 2
                              ? 'Could be Better'
                              : 'Needs Improvement'}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    Additional Comments
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any specific praise or suggestions?"
                    rows={4}
                    className="w-full resize-none rounded-[2rem] border border-slate-100 bg-white px-8 py-6 font-medium text-slate-900 shadow-sm shadow-slate-100/50 transition-all placeholder:text-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 focus:outline-none"
                  />
                </div>
              </form>
            </div>

            {/* Glossy Footer */}
            <div className="sticky bottom-0 z-30 border-t border-slate-50 bg-white p-10">
              <button
                type="submit"
                form="feedback-form"
                disabled={isSubmitting || rating === 0}
                className="group/btn relative h-16 w-full overflow-hidden rounded-[2rem] bg-slate-900 text-sm font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] disabled:bg-slate-50 disabled:text-slate-200"
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
