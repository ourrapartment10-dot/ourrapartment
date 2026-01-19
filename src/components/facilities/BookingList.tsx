'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      const res = await fetch('/api/bookings');
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
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
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10';
      case 'CANCELLED':
        return 'bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/10';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <Clock className="h-4 w-4 opacity-50" />;
      default:
        return <AlertCircle className="h-4 w-4 animate-pulse" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-32">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="animate-pulse text-xs font-bold tracking-widest text-slate-400 uppercase">
          Syncing reservations...
        </p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-slate-50 py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
          <Calendar className="h-10 w-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Quiet on this front
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-400">
          No bookings found in the history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 sm:p-8"
            >
              <div className="flex h-full flex-col space-y-6 sm:space-y-8">
                {/* Header Section with Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 transition-colors group-hover:bg-blue-50 sm:h-14 sm:w-14">
                        <Target className="h-5 w-5 text-slate-400 group-hover:text-blue-600 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate text-base leading-none font-black text-slate-900 sm:text-xl">
                          {booking.facility.name}
                        </h3>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase sm:text-xs">
                          #{booking.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {/* Status Badge - Right Side */}
                    <span
                      className={cn(
                        'flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[9px] font-black tracking-wider uppercase ring-1 sm:text-[10px]',
                        getStatusStyles(booking.status)
                      )}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="hidden sm:inline">{booking.status}</span>
                    </span>
                  </div>

                  {booking.purpose && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-sm leading-relaxed font-medium text-slate-600 italic">
                        "{booking.purpose}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Logistics Section */}
                <div className="grid grid-cols-2 gap-6 border-y border-slate-50 py-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      <Calendar className="h-3 w-3" />
                      Scheduled Date
                    </label>
                    <p className="text-sm font-black text-slate-900">
                      {format(new Date(booking.startTime), 'EEEE, d MMM')}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      <Clock className="h-3 w-3" />
                      Time Window
                    </label>
                    <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                      {format(new Date(booking.startTime), 'HH:mm')}
                      <ArrowRight className="h-3 w-3 text-slate-300" />
                      {format(new Date(booking.endTime), 'HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Participants & Cost */}
                <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                  {isAdmin && booking.user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600">
                        {booking.user.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black tracking-tight text-slate-900">
                          {booking.user.name}
                        </p>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Flat {booking.user.property?.flatNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        Reserved for you
                      </span>
                    </div>
                  )}

                  {booking.totalCost > 0 && (
                    <div className="text-left sm:text-right">
                      <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Total Due
                      </p>
                      <p className="text-lg font-black break-all text-slate-900 sm:text-xl">
                        ₹{booking.totalCost.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Administrative Actions */}
                {processingId === booking.id ? (
                  <div className="flex h-14 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="flex gap-3 pt-4">
                    {isAdmin && booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, 'APPROVED')
                          }
                          className="h-14 flex-1 rounded-2xl bg-slate-900 text-xs font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-black"
                        >
                          Authorize
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, 'REJECTED')
                          }
                          className="h-14 rounded-2xl border border-slate-100 bg-white px-6 text-xs font-black tracking-[0.2em] text-rose-600 uppercase transition-all hover:border-rose-100 hover:bg-rose-50"
                        >
                          Deny
                        </button>
                      </>
                    )}
                    {!isAdmin && booking.status === 'PENDING' && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking.id, 'CANCELLED')
                        }
                        className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white text-xs font-black tracking-[0.2em] text-slate-400 uppercase transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
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
