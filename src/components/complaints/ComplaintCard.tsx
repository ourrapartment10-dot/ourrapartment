"use client";

import { useState } from "react";
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
    Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ComplaintStatus, ComplaintType, UserRole } from "@/generated/client";
import { resolveComplaint } from "@/app/actions/complaints";
import FeedbackModal from "./FeedbackModal";
import { cn } from "@/lib/utils";
import S3Image from "@/components/common/S3Image";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface ComplaintCardProps {
    complaint: any;
    currentUser: any;
    onUpdate: () => void;
    onEdit?: () => void;
}

export default function ComplaintCard({ complaint, currentUser, onUpdate, onEdit }: ComplaintCardProps) {
    const [isResolving, setIsResolving] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN;
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
            <div className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col h-full">

                {/* Visual Identity / Header Strip */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 border-b border-slate-50">
                    {/* Status Gradient Overlay */}
                    <div className={cn(
                        "absolute inset-0 opacity-10 bg-gradient-to-br",
                        isResolved ? "from-emerald-600 to-teal-500" : "from-amber-600 to-orange-500"
                    )} />

                    {/* Image or Placeholder */}
                    {complaint.images && complaint.images.length > 0 ? (
                        <S3Image
                            src={complaint.images[0]}
                            alt={complaint.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            containerClassName="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-200">
                            <div className="p-5 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform">
                                <MessageSquare className="h-10 w-10 text-slate-300" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Issue Report</span>
                        </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-500 scale-95 group-hover:scale-100",
                            complaint.type === ComplaintType.PRIVATE
                                ? "bg-white/90 text-slate-600 border-white"
                                : "bg-blue-600/90 text-white border-blue-400/50"
                        )}>
                            {complaint.type === ComplaintType.PRIVATE ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{complaint.type === ComplaintType.PRIVATE ? "Private" : "Public"}</span>
                        </div>

                        {!isResolved && isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md border border-white text-slate-900 shadow-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                                title="Edit Report"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 flex flex-col flex-1 space-y-6">
                    {/* Header: Title & Time */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl lg:text-2xl font-[900] text-slate-900 leading-[1.1] tracking-tight group-hover:text-blue-600 transition-colors">
                                {complaint.title}
                            </h3>
                            <div className="flex flex-col items-end flex-shrink-0 text-slate-300">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {format(new Date(complaint.createdAt), 'MMM d')}
                                </span>
                                <span className="text-[9px] font-bold">
                                    {format(new Date(complaint.createdAt), 'yyyy')}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                            {complaint.description}
                        </p>
                    </div>

                    {/* Middle Section: Progress & Issuer */}
                    <div className="space-y-6 pt-2">
                        {/* Status Label */}
                        {!isResolved ? (
                            <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-[1.5rem] border border-amber-100/50">
                                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest leading-none mb-1">Status</p>
                                    <p className="text-xs font-black text-amber-900">In Progress</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100/50">
                                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest leading-none mb-1">Status</p>
                                    <p className="text-xs font-black text-emerald-900">Resolved</p>
                                </div>
                                {getResolutionTime() && (
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest leading-none mb-1 text-nowrap">Resolution Time</p>
                                        <p className="text-xs font-black text-emerald-900">{getResolutionTime()}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Issuer */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-[1.5rem] border border-slate-100/50">
                            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                {complaint.user?.image ? (
                                    <img src={complaint.user.image} alt={complaint.user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-5 w-5 text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reported by</p>
                                <p className="text-xs font-black text-slate-900">{complaint.user?.name || "Resident"}</p>
                            </div>
                            <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-900">{complaint.user?.property?.flatNumber || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resolve Actions (Admin Only) or Feedback */}
                    <div className="pt-2 mt-auto">
                        {!isResolved ? (
                            isAdmin && (
                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    disabled={isResolving}
                                    className="w-full h-14 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                                >
                                    {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
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
                                    <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-3 w-3",
                                                        i < (complaint.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-100"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Rating</span>
                                    </div>
                                ) : (
                                    isOwner && (
                                        <button
                                            onClick={() => setIsFeedbackModalOpen(true)}
                                            className="w-full h-14 bg-amber-500 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-amber-100"
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
