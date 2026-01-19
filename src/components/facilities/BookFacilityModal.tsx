"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    Loader2,
    X,
    Info,
    MapPin,
    ArrowRight,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookFacilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    facility: any;
}

export default function BookFacilityModal({ isOpen, onClose, facility }: BookFacilityModalProps) {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(`${date}T${endTime}`);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facilityId: facility.id,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    purpose
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Booking failed");
            }

            // Successfully submitted - you could show a success state or close
            onClose();
            setDate("");
            setStartTime("");
            setEndTime("");
            setPurpose("");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to book");
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
                        className="fixed top-0 left-0 w-screen h-screen bg-slate-900/60 backdrop-blur-xl z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-lg max-h-[85vh] bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] z-[110] overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Elegant Header */}
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter leading-none mb-1">
                                        Secure Slot
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        {facility.name}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="h-6 w-6 text-slate-300 hover:text-slate-900" />
                            </button>
                        </div>

                        {/* Persistent Error Banner - Stays Red as it is an error */}
                        <div className="px-10 z-20">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto", marginTop: 24 }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-4 text-rose-600 overflow-hidden shadow-sm shadow-rose-100/50"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <X className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Inquiry Issue</p>
                                            <p className="text-sm font-bold">{error}</p>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-2 hover:bg-rose-100 rounded-lg transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Interactive Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
                            <form id="booking-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Scheduling
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-6 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            Arrival
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <ArrowRight className="h-3 w-3" />
                                            Departure
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {facility.hourlyRate && calculateCost() > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-xl shadow-blue-200/50 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Estimated Contribution</p>
                                            <p className="text-3xl font-[900] tracking-tighter">₹{calculateCost().toFixed(2)}</p>
                                        </div>
                                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Info className="h-3 w-3" />
                                        Context
                                    </label>
                                    <textarea
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        placeholder="Briefly state the nature of your visit..."
                                        rows={3}
                                        className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300 resize-none shadow-inner"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* High-Contrast Footer */}
                        <div className="p-10 border-t border-slate-50 bg-white sticky bottom-0 z-30 backdrop-blur-sm">
                            <button
                                type="submit"
                                form="booking-form"
                                disabled={isSubmitting}
                                className="group/btn w-full relative h-16 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-[0.98]"
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
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-all duration-500" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
