'use client';

import { useState } from 'react';
import {
  Users,
  DollarSign,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Check,
  Info,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookFacilityModal from './BookFacilityModal';
import EditFacilityModal from './EditFacilityModal';
import S3Image from '@/components/common/S3Image';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function FacilityCard({
  facility,
  isAdmin,
  onUpdate,
}: {
  facility: any;
  isAdmin: boolean;
  onUpdate: () => void;
}) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/facilities/${facility.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Delete failed', error);
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
        className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
      >
        {/* Visual Header */}
        <div className="relative h-64 overflow-hidden">
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
                  className="h-full w-full object-cover"
                  containerClassName="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-gray-200">
                <Calendar className="h-16 w-16 opacity-20" />
              </div>
            )}
          </AnimatePresence>

          {/* Floating Badges */}
          <div className="pointer-events-none absolute top-6 right-6 left-6 flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="rounded-2xl border border-white/40 bg-white/90 px-4 py-2 text-[10px] font-black tracking-[0.15em] text-gray-900 uppercase shadow-xl backdrop-blur-md"
            >
              {facility.hourlyRate
                ? `₹${facility.hourlyRate} / Hour`
                : 'Free Access'}
            </motion.div>

            {isAdmin && (
              <div className="pointer-events-auto flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-2xl bg-white/90 p-3 text-slate-900 shadow-xl shadow-black/5 backdrop-blur-md transition-all hover:bg-slate-900 hover:text-white"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isDeleting}
                  className="rounded-2xl bg-white/90 p-3 text-rose-600 shadow-xl shadow-black/5 backdrop-blur-md transition-all hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Meta Overlays */}
          <div className="absolute right-6 bottom-6 left-6 flex flex-wrap gap-2">
            {facility.capacity && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
                <Users className="h-3 w-3" />
                {facility.capacity} pax
              </div>
            )}
            {facility.amenities?.slice(0, 2).map((amenity: string) => (
              <div
                key={amenity}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/20 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md"
              >
                <Check className="h-3 w-3 opacity-60" />
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="relative flex flex-1 flex-col bg-white p-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                {facility.name}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <MapPin className="h-3 w-3" />
                Community Square
              </div>
            </div>

            {facility.description && (
              <p className="line-clamp-2 text-sm leading-relaxed font-medium text-slate-500">
                {facility.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-2">
              {facility.amenities?.slice(2, 5).map((amenity: string) => (
                <span
                  key={amenity}
                  className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-black tracking-tighter text-slate-500 uppercase"
                >
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
                className="group/btn relative h-14 w-full overflow-hidden rounded-2xl bg-slate-900 text-sm font-black text-white shadow-2xl shadow-slate-200 transition-all hover:bg-black active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest uppercase">
                  Reserve this space
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-all duration-500 group-hover:opacity-100" />
              </button>
            )}

            {isAdmin && (
              <div className="text-center">
                <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
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
