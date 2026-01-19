'use client';

import { useState } from 'react';
import {
  Upload,
  X,
  Loader2,
  Plus,
  DollarSign,
  Users,
  Type,
  AlignLeft,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useS3Upload } from '@/hooks/useS3';
import S3Image from '@/components/common/S3Image';

interface CreateFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFacilityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFacilityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use S3 upload hook
  const {
    upload,
    uploading,
    uploadedUrl,
    reset: resetUpload,
  } = useS3Upload('facilities');

  const handleAmenityAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && amenityInput.trim()) {
      e.preventDefault();
      if (!amenities.includes(amenityInput.trim())) {
        setAmenities([...amenities, amenityInput.trim()]);
      }
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    await upload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          capacity: capacity ? parseInt(capacity) : null,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          amenities,
          images: uploadedUrl ? [uploadedUrl] : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create facility');
      }

      onSuccess();
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setCapacity('');
      setHourlyRate('');
      setAmenities([]);
      resetUpload();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 'An unexpected error occurred. Please try again.'
      );
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
            className="fixed top-0 left-0 z-[100] h-screen w-screen bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 z-[110] flex h-auto max-h-[85vh] w-[98%] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[3rem] border border-white/20 bg-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)]"
          >
            {/* High-End Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-50 bg-white px-10 py-8">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 shadow-xl shadow-rose-200">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="mb-1 text-3xl leading-none font-[900] tracking-tighter text-slate-900">
                    Craft New Space
                  </h2>
                  <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                    Expanding the Community Horizon
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group rounded-full p-4 transition-all hover:bg-slate-50"
              >
                <X className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
              </button>
            </div>

            {/* Persistent Error Banner */}
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
                        Attention Required
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

            {/* Immersive Body */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50/30 p-10">
              <form
                id="create-facility-form"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-12 lg:grid-cols-2"
              >
                {/* Image & Description Section */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                      <ImageIcon className="h-3 w-3" />
                      Visual Identity
                    </label>
                    <div
                      className={cn(
                        'group relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white shadow-sm transition-all',
                        uploadedUrl
                          ? 'border-transparent ring-4 ring-slate-100'
                          : 'hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'
                      )}
                    >
                      {uploadedUrl ? (
                        <div className="relative h-full w-full">
                          <S3Image
                            src={uploadedUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            containerClassName="h-full w-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetUpload();
                              }}
                              className="flex items-center gap-3 rounded-[1.5rem] bg-white px-8 py-4 text-xs font-black tracking-widest text-rose-600 uppercase shadow-2xl transition-all hover:scale-105"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove Asset
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 z-10 cursor-pointer opacity-0"
                            disabled={uploading}
                          />
                          <div className="flex flex-col items-center gap-4 text-slate-300 transition-all group-hover:text-slate-900">
                            {uploading ? (
                              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 shadow-inner transition-all group-hover:scale-110 group-hover:bg-white">
                                <Upload className="h-8 w-8" />
                              </div>
                            )}
                            <div className="text-center">
                              <span className="text-xs font-black tracking-[0.2em] uppercase">
                                {uploading
                                  ? 'Uploading Content...'
                                  : 'Drop Brand Asset'}
                              </span>
                              <p className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase">
                                JPG, PNG, WEBP up to 5MB
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                      <AlignLeft className="h-3 w-3" />
                      The Narrative
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell the story of this space..."
                      rows={6}
                      className="w-full resize-none rounded-[2rem] border border-slate-100 bg-white px-8 py-6 font-medium text-slate-900 shadow-sm shadow-slate-100/50 transition-all placeholder:text-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-10 lg:border-l lg:border-slate-50 lg:pl-10">
                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                        <Type className="h-3 w-3" />
                        Naming & Identity
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. The Glass Observatory"
                        className="w-full rounded-[2rem] border border-slate-100 bg-white px-8 py-6 text-xl font-black text-slate-900 shadow-sm shadow-slate-100/50 transition-all placeholder:text-slate-100 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-nowrap text-slate-400 uppercase">
                          <DollarSign className="h-3 w-3" />
                          Access Rate (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-[1.5rem] border border-slate-100 bg-white px-8 py-5 font-black text-slate-900 transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-nowrap text-slate-400 uppercase">
                          <Users className="h-3 w-3" />
                          Max Crowd
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          placeholder="Persons"
                          className="w-full rounded-[1.5rem] border border-slate-100 bg-white px-8 py-5 font-black text-slate-900 transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                        <Plus className="h-3 w-3" />
                        Core Amenities
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={amenityInput}
                          onChange={(e) => setAmenityInput(e.target.value)}
                          onKeyDown={handleAmenityAdd}
                          placeholder="Type feature & press Enter"
                          className="w-full rounded-[1.5rem] border border-slate-100 bg-white px-8 py-5 text-sm font-bold text-slate-900 shadow-sm shadow-slate-100/50 transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <AnimatePresence>
                          {amenities.map((amenity) => (
                            <motion.span
                              key={amenity}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[9px] font-black tracking-widest text-white uppercase shadow-lg shadow-slate-200"
                            >
                              {amenity}
                              <button
                                type="button"
                                onClick={() => removeAmenity(amenity)}
                                className="transition-colors hover:text-rose-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Glossy Footer */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end border-t border-slate-50 bg-white p-10">
              <button
                type="submit"
                form="create-facility-form"
                disabled={isSubmitting || uploading}
                className="group/submit relative w-full overflow-hidden rounded-[2rem] bg-rose-600 px-16 py-6 text-sm font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-rose-200 transition-all hover:-translate-y-1 hover:bg-rose-700 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 lg:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Integrating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Publish Space
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 opacity-0 transition-all duration-500 group-hover/submit:opacity-100" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
