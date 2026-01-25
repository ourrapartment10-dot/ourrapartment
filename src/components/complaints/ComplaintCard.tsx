'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Lock,
  Globe,
  User as UserIcon,
  MessageSquare,
  Star,
  Loader2,
  Pencil,
  AlertCircle,
  Info,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  formatDistanceToNow,
  differenceInHours,
  differenceInMinutes,
  format,
} from 'date-fns';
import { ComplaintStatus, ComplaintType, UserRole } from '@/generated/client';
import { resolveComplaint } from '@/app/actions/complaints';
import FeedbackModal from './FeedbackModal';
import { cn } from '@/lib/utils';
import S3Image from '@/components/common/S3Image';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface ComplaintCardProps {
  complaint: any;
  currentUser: any;
  onUpdate: () => void;
  onEdit?: () => void;
}

export default function ComplaintCard({
  complaint,
  currentUser,
  onUpdate,
  onEdit,
}: ComplaintCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isAdmin =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.SUPER_ADMIN;
  const isOwner = currentUser?.id === complaint.userId;
  const isResolved = complaint.status === ComplaintStatus.RESOLVED;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await resolveComplaint(complaint.id);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsResolving(false);
    }
  };

  const getResolutionTime = () => {
    if (!complaint.resolvedAt) return null;
    const start = new Date(complaint.createdAt);
    const end = new Date(complaint.resolvedAt);
    const mins = differenceInMinutes(end, start);
    const hours = differenceInHours(end, start);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
        {/* Visual Identity / Header Strip */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-slate-50 bg-slate-50">
          {/* Status Gradient Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-10',
              isResolved
                ? 'from-emerald-600 to-teal-500'
                : 'from-amber-600 to-orange-500'
            )}
          />

          {/* Image or Placeholder */}
          {complaint.images && complaint.images.length > 0 ? (
            <S3Image
              src={complaint.images[0]}
              alt={complaint.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-slate-200">
              <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/50 transition-transform group-hover:scale-110">
                <MessageSquare className="h-10 w-10 text-slate-300" />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
                Issue Report
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-6 right-6 left-6 flex items-center justify-between">
            <div
              className={cn(
                'flex scale-95 items-center gap-2 rounded-2xl border px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-500 group-hover:scale-100',
                complaint.type === ComplaintType.PRIVATE
                  ? 'border-white bg-white/90 text-slate-600'
                  : 'border-blue-400/50 bg-blue-600/90 text-white'
              )}
            >
              {complaint.type === ComplaintType.PRIVATE ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              <span className="text-[10px] font-black tracking-widest uppercase">
                {complaint.type === ComplaintType.PRIVATE
                  ? 'Private'
                  : 'Public'}
              </span>
            </div>

            {!isResolved && isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-white/90 text-slate-900 shadow-lg backdrop-blur-md transition-all hover:bg-slate-900 hover:text-white active:scale-90"
                title="Edit Report"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col space-y-6 p-8">
          {/* Header: Title & Time */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl leading-[1.1] font-[900] tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 lg:text-2xl">
                {complaint.title}
              </h3>
              <div className="flex flex-shrink-0 flex-col items-end text-slate-300">
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {format(new Date(complaint.createdAt), 'MMM d')}
                </span>
                <span className="text-[9px] font-bold">
                  {format(new Date(complaint.createdAt), 'yyyy')}
                </span>
              </div>
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed font-medium text-slate-600">
              {complaint.description}
            </p>
          </div>

          {/* Middle Section: Progress & Issuer */}
          <div className="space-y-6 pt-2">
            {/* Status Label */}
            {!isResolved ? (
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-amber-100/50 bg-amber-50/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-100 bg-white text-amber-500 shadow-sm">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="mb-1 text-[9px] leading-none font-black tracking-widest text-amber-600/70 uppercase">
                    Status
                  </p>
                  <p className="text-xs font-black text-amber-900">
                    In Progress
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-emerald-100/50 bg-emerald-50/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-500 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[9px] leading-none font-black tracking-widest text-emerald-600/70 uppercase">
                    Status
                  </p>
                  <p className="text-xs font-black text-emerald-900">
                    Resolved
                  </p>
                </div>
                {getResolutionTime() && (
                  <div className="text-right">
                    <p className="mb-1 text-[9px] leading-none font-black tracking-widest text-nowrap text-emerald-600/70 uppercase">
                      Resolution Time
                    </p>
                    <p className="text-xs font-black text-emerald-900">
                      {getResolutionTime()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Issuer */}
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-100/50 bg-slate-50/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {complaint.user?.image ? (
                  <img
                    src={complaint.user.image}
                    alt={complaint.user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[9px] leading-none font-black tracking-widest text-slate-400 uppercase">
                  Reported by
                </p>
                <p className="text-xs font-black text-slate-900">
                  {complaint.user?.name || 'Resident'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-black text-slate-900">
                  {complaint.user?.property?.flatNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Resolve Actions (Admin Only) or Feedback */}
          <div className="mt-auto pt-2">
            {!isResolved ? (
              isAdmin && (
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isResolving}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 text-xs font-bold tracking-widest text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
                >
                  {isResolving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Mark as Resolved
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="space-y-4">
                {complaint.rating ? (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i < (complaint.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-100'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Community Rating
                    </span>
                  </div>
                ) : (
                  isOwner && (
                    <button
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.5rem] bg-amber-500 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 active:scale-[0.98]"
                    >
                      <Star className="h-4 w-4 fill-current" />
                      Rate Resolution
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccess={onUpdate}
        complaintId={complaint.id}
      />

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleResolve}
        title="Mark as Resolved?"
        message="Are you sure you want to mark this complaint as resolved? This action will notify the resident and allow them to provide feedback."
        confirmText="Yes, Resolve"
        variant="info"
        isLoading={isResolving}
      />
    </>
  );
}
