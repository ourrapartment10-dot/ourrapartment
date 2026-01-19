'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Loader2,
  X,
  Info,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: any;
}

export default function BookFacilityModal({
  isOpen,
  onClose,
  facility,
}: BookFacilityModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Booking failed');
      }

      // Successfully submitted - you could show a success state or close
      onClose();
      setDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCost = () => {
    if (!startTime || !endTime || !facility.hourlyRate) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours * facility.hourlyRate);
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
            className="fixed top-0 left-0 z-[100] h-screen w-screen bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 z-[110] flex max-h-[85vh] w-[98%] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[3rem] border border-white/20 bg-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)]"
          >
            {/* Elegant Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-50 bg-white px-10 py-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="mb-1 text-2xl leading-none font-[900] tracking-tighter text-slate-900">
                    Secure Slot
                  </h2>
                  <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    {facility.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-3 transition-colors hover:bg-slate-50"
              >
                <X className="h-6 w-6 text-slate-300 hover:text-slate-900" />
              </button>
            </div>

            {/* Persistent Error Banner - Stays Red as it is an error */}
            <div className="z-20 px-10">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      height: 'auto',
                      marginTop: 24,
                    }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="flex items-center gap-4 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-600 shadow-sm shadow-rose-100/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <X className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-[10px] leading-none font-black tracking-widest uppercase">
                        Inquiry Issue
                      </p>
                      <p className="text-sm font-bold">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="rounded-lg p-2 transition-colors hover:bg-rose-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Body */}
            <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-10">
              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    <Calendar className="h-3 w-3" />
                    Scheduling
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-[1.5rem] border border-slate-100 bg-slate-50 py-5 pr-6 pl-6 text-sm font-black text-slate-900 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                      <Clock className="h-3 w-3" />
                      Arrival
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-[1.5rem] border border-slate-100 bg-slate-50 px-6 py-5 text-sm font-black text-slate-900 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                      <ArrowRight className="h-3 w-3" />
                      Departure
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-[1.5rem] border border-slate-100 bg-slate-50 px-6 py-5 text-sm font-black text-slate-900 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {facility.hourlyRate && calculateCost() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200/50"
                  >
                    <div>
                      <p className="mb-1 text-[10px] font-black tracking-[0.2em] uppercase opacity-80">
                        Estimated Contribution
                      </p>
                      <p className="text-3xl font-[900] tracking-tighter">
                        ₹{calculateCost().toFixed(2)}
                      </p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/20 backdrop-blur-md">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    <Info className="h-3 w-3" />
                    Context
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state the nature of your visit..."
                    rows={3}
                    className="w-full resize-none rounded-[1.5rem] border border-slate-100 bg-slate-50 px-8 py-6 font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
                  />
                </div>
              </form>
            </div>

            {/* High-Contrast Footer */}
            <div className="sticky bottom-0 z-30 border-t border-slate-50 bg-white p-10 backdrop-blur-sm">
              <button
                type="submit"
                form="booking-form"
                disabled={isSubmitting}
                className="group/btn relative h-16 w-full overflow-hidden rounded-[2rem] bg-blue-600 text-sm font-black tracking-[0.3em] text-white uppercase shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Confirming Access...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirm Reservation
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-all duration-500 group-hover/btn:opacity-100" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
