"use client";

import { useState } from "react";
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
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useS3Upload } from "@/hooks/useS3";
import S3Image from "@/components/common/S3Image";

interface CreateFacilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateFacilityModal({ isOpen, onClose, onSuccess }: CreateFacilityModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [amenities, setAmenities] = useState<string[]>([]);
    const [amenityInput, setAmenityInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use S3 upload hook
    const { upload, uploading, uploadedUrl, reset: resetUpload } = useS3Upload("facilities");

    const handleAmenityAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && amenityInput.trim()) {
            e.preventDefault();
            if (!amenities.includes(amenityInput.trim())) {
                setAmenities([...amenities, amenityInput.trim()]);
            }
            setAmenityInput("");
        }
    };

    const removeAmenity = (amenity: string) => {
        setAmenities(amenities.filter(a => a !== amenity));
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
            const res = await fetch("/api/facilities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    capacity: capacity ? parseInt(capacity) : null,
                    hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                    amenities,
                    images: uploadedUrl ? [uploadedUrl] : []
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create facility");
            }

            onSuccess();
            onClose();
            // Reset form
            setName("");
            setDescription("");
            setCapacity("");
            setHourlyRate("");
            setAmenities([]);
            resetUpload();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred. Please try again.");
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
                        className="fixed top-0 left-0 w-screen h-screen bg-slate-900/60 backdrop-blur-xl z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-4xl h-auto max-h-[85vh] bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] z-[110] overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* High-End Header */}
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between sticky top-0 z-20 bg-white">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-200">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter leading-none mb-1">
                                        Craft New Space
                                    </h2>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                                        Expanding the Community Horizon
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="group p-4 hover:bg-slate-50 rounded-full transition-all">
                                <X className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
                            </button>
                        </div>

                        {/* Persistent Error Banner */}
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
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Attention Required</p>
                                            <p className="text-sm font-bold">{error}</p>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-2 hover:bg-rose-100 rounded-lg transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Immersive Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gradient-to-b from-white to-slate-50/30">

                            <form id="create-facility-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                                {/* Image & Description Section */}
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3" />
                                            Visual Identity
                                        </label>
                                        <div className={cn(
                                            "aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden relative shadow-sm group",
                                            uploadedUrl ? "border-transparent ring-4 ring-slate-100" : "hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
                                        )}>
                                            {uploadedUrl ? (
                                                <div className="h-full w-full relative">
                                                    <S3Image src={uploadedUrl} alt="Preview" className="w-full h-full object-cover" containerClassName="h-full w-full" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                                                            className="px-8 py-4 bg-white text-rose-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
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
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        disabled={uploading}
                                                    />
                                                    <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-slate-900 transition-all">
                                                        {uploading ? (
                                                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                                        ) : (
                                                            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-inner">
                                                                <Upload className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                        <div className="text-center">
                                                            <span className="font-black text-xs uppercase tracking-[0.2em]">
                                                                {uploading ? "Uploading Content..." : "Drop Brand Asset"}
                                                            </span>
                                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG, WEBP up to 5MB</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <AlignLeft className="h-3 w-3" />
                                            The Narrative
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Tell the story of this space..."
                                            rows={6}
                                            className="w-full px-8 py-6 bg-white border border-slate-100 rounded-[2rem] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-200 resize-none shadow-sm shadow-slate-100/50"
                                        />
                                    </div>
                                </div>

                                {/* Configuration Section */}
                                <div className="space-y-10 lg:pl-10 lg:border-l lg:border-slate-50">
                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Type className="h-3 w-3" />
                                                Naming & Identity
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. The Glass Observatory"
                                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-[2rem] font-black text-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-100 shadow-sm shadow-slate-100/50"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 text-nowrap">
                                                    <DollarSign className="h-3 w-3" />
                                                    Access Rate (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={hourlyRate}
                                                    onChange={(e) => setHourlyRate(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full px-8 py-5 bg-white border border-slate-100 rounded-[1.5rem] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 text-nowrap">
                                                    <Users className="h-3 w-3" />
                                                    Max Crowd
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={capacity}
                                                    onChange={(e) => setCapacity(e.target.value)}
                                                    placeholder="Persons"
                                                    className="w-full px-8 py-5 bg-white border border-slate-100 rounded-[1.5rem] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
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
                                                    className="w-full px-8 py-5 bg-white border border-slate-100 rounded-[1.5rem] font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm shadow-slate-100/50"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <AnimatePresence>
                                                    {amenities.map(amenity => (
                                                        <motion.span
                                                            key={amenity}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-slate-200"
                                                        >
                                                            {amenity}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAmenity(amenity)}
                                                                className="hover:text-rose-400 transition-colors"
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
                        <div className="p-10 border-t border-slate-50 bg-white flex items-center justify-end sticky bottom-0 z-10">
                            <button
                                type="submit"
                                form="create-facility-form"
                                disabled={isSubmitting || uploading}
                                className="group/submit relative w-full lg:w-auto px-16 py-6 bg-rose-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-300 shadow-2xl shadow-rose-200 transition-all hover:-translate-y-1 active:scale-[0.98]"
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
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 opacity-0 group-hover/submit:opacity-100 transition-all duration-500" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
