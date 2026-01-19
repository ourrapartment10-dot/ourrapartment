"use client";

import { useState } from "react";
import { Users, DollarSign, Edit3, Trash2, Calendar, MapPin, Check, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BookFacilityModal from "./BookFacilityModal";
import EditFacilityModal from "./EditFacilityModal";
import S3Image from "@/components/common/S3Image";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function FacilityCard({ facility, isAdmin, onUpdate }: { facility: any, isAdmin: boolean, onUpdate: () => void }) {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/facilities/${facility.id}`, { method: 'DELETE' });
            if (res.ok) onUpdate();
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
            >
                {/* Visual Header */}
                <div className="h-64 relative overflow-hidden">
                    <AnimatePresence>
                        {facility.images && facility.images[0] ? (
                            <motion.div
                                className="absolute inset-0"
                                animate={{ scale: isHovered ? 1.1 : 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <S3Image
                                    src={facility.images[0]}
                                    alt={facility.name}
                                    className="w-full h-full object-cover"
                                    containerClassName="h-full w-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-200 bg-gradient-to-br from-slate-50 to-slate-100">
                                <Calendar className="h-16 w-16 opacity-20" />
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 shadow-xl border border-white/40"
                        >
                            {facility.hourlyRate ? `₹${facility.hourlyRate} / Hour` : 'Free Access'}
                        </motion.div>

                        {isAdmin && (
                            <div className="flex gap-2 pointer-events-auto">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-black/5"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    disabled={isDeleting}
                                    className="p-3 bg-white/90 backdrop-blur-md text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-black/5"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Meta Overlays */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                        {facility.capacity && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                                <Users className="h-3 w-3" />
                                {facility.capacity} pax
                            </div>
                        )}
                        {facility.amenities?.slice(0, 2).map((amenity: string) => (
                            <div key={amenity} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                                <Check className="h-3 w-3 opacity-60" />
                                {amenity}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 flex flex-col flex-1 relative bg-white">
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                {facility.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <MapPin className="h-3 w-3" />
                                Community Square
                            </div>
                        </div>

                        {facility.description && (
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                                {facility.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {facility.amenities?.slice(2, 5).map((amenity: string) => (
                                <span key={amenity} className="px-2 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-tighter rounded-md">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8">
                        {!isAdmin && (
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="group/btn w-full relative h-14 bg-slate-900 text-white rounded-2xl font-black text-sm overflow-hidden transition-all hover:bg-black active:scale-[0.98] shadow-2xl shadow-slate-200"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                                    Reserve this space
                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            </button>
                        )}

                        {isAdmin && (
                            <div className="text-center">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                    Administrator View
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <BookFacilityModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                facility={facility}
            />

            <EditFacilityModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={onUpdate}
                facility={facility}
            />
            <ConfirmDialog
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Facility?"
                message={`Are you sure you want to delete "${facility.name}"? This action cannot be undone and will affect all existing bookings.`}
                confirmText="Yes, Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
