"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    MoreVertical,
    DollarSign,
    Target,
    ArrowRight,
    MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BookingListProps {
    isAdmin: boolean;
}

export default function BookingList({ isAdmin }: BookingListProps) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/bookings");
            const data = await res.json();
            if (res.ok) setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchBookings();
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10";
            case "REJECTED":
                return "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10";
            case "CANCELLED":
                return "bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/10";
            default:
                return "bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED": return <CheckCircle2 className="h-4 w-4" />;
            case "REJECTED": return <XCircle className="h-4 w-4" />;
            case "CANCELLED": return <Clock className="h-4 w-4 opacity-50" />;
            default: return <AlertCircle className="h-4 w-4 animate-pulse" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing reservations...</p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                    <Calendar className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Quiet on this front</h3>
                <p className="text-slate-400 text-sm font-medium mt-1">No bookings found in the history.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {bookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                        >
                            <div className="flex flex-col h-full space-y-6 sm:space-y-8">
                                {/* Header Section with Status */}
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors flex-shrink-0">
                                                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base sm:text-xl font-black text-slate-900 leading-none mb-1 truncate">
                                                    {booking.facility.name}
                                                </h3>
                                                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                                    #{booking.id.slice(-6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Status Badge - Right Side */}
                                        <span className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] sm:text-[10px] font-black uppercase tracking-wider ring-1 flex-shrink-0",
                                            getStatusStyles(booking.status)
                                        )}>
                                            {getStatusIcon(booking.status)}
                                            <span className="hidden sm:inline">{booking.status}</span>
                                        </span>
                                    </div>

                                    {booking.purpose && (
                                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                                                "{booking.purpose}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Logistics Section */}
                                <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            Scheduled Date
                                        </label>
                                        <p className="text-sm font-black text-slate-900">
                                            {format(new Date(booking.startTime), "EEEE, d MMM")}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            Time Window
                                        </label>
                                        <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            {format(new Date(booking.startTime), "HH:mm")}
                                            <ArrowRight className="h-3 w-3 text-slate-300" />
                                            {format(new Date(booking.endTime), "HH:mm")}
                                        </p>
                                    </div>
                                </div>

                                {/* Participants & Cost */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                                    {isAdmin && booking.user ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px] flex-shrink-0">
                                                {booking.user.name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 tracking-tight truncate">{booking.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Flat {booking.user.property?.flatNumber || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Reserved for you</span>
                                        </div>
                                    )}

                                    {booking.totalCost > 0 && (
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                                            <p className="text-lg sm:text-xl font-black text-slate-900 break-all">₹{booking.totalCost.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Administrative Actions */}
                                {processingId === booking.id ? (
                                    <div className="h-14 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="pt-4 flex gap-3">
                                        {isAdmin && booking.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "APPROVED")}
                                                    className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all"
                                                >
                                                    Authorize
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                                                    className="h-14 px-6 border border-slate-100 bg-white text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 hover:border-rose-100 transition-all"
                                                >
                                                    Deny
                                                </button>
                                            </>
                                        )}
                                        {!isAdmin && booking.status === "PENDING" && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                className="w-full h-14 border-2 border-slate-100 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all"
                                            >
                                                Withdraw Request
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
