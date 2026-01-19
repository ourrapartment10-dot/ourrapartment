"use client";

import { useState, useEffect } from "react";
import {
    X,
    Loader2,
    Send,
    Globe,
    Lock,
    Upload,
    Image as ImageIcon,
    Trash2,
    Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ComplaintType } from "@/generated/client";
import { createComplaint, updateComplaint } from "@/app/actions/complaints";
import { cn } from "@/lib/utils";
import { useS3Upload } from "@/hooks/useS3";
import S3Image from "@/components/common/S3Image";

interface CreateComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    complaintToEdit?: any; // If provided, mode is 'edit'
}

export default function CreateComplaintModal({ isOpen, onClose, onSuccess, complaintToEdit }: CreateComplaintModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<ComplaintType>(ComplaintType.PRIVATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image Upload State
    const { upload, uploading, uploadedUrl, reset: resetUpload, setUrl } = useS3Upload("complaints");

    // Initialize/Reset form based on complaintToEdit
    useEffect(() => {
        if (isOpen) {
            if (complaintToEdit) {
                setTitle(complaintToEdit.title);
                setDescription(complaintToEdit.description);
                setType(complaintToEdit.type);
                if (complaintToEdit.images && complaintToEdit.images.length > 0) {
                    setUrl(complaintToEdit.images[0]);
                } else {
                    resetUpload();
                }
            } else {
                setTitle("");
                setDescription("");
                setType(ComplaintType.PRIVATE);
                resetUpload();
            }
        }
    }, [isOpen, complaintToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (complaintToEdit) {
                await updateComplaint(complaintToEdit.id, {
                    title,
                    description,
                    type,
                    images: uploadedUrl ? [uploadedUrl] : []
                });
            } else {
                await createComplaint({
                    title,
                    description,
                    type,
                    images: uploadedUrl ? [uploadedUrl] : []
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit complaint", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await upload(file);
        }
    };

    const isEditMode = !!complaintToEdit;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-xl z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                    {isEditMode ? "Edit Complaint" : "Raise a Complaint"}
                                </h2>
                                <p className="text-sm font-medium text-slate-500">
                                    {isEditMode ? "Update the details of your issue." : "We are here to help resolve your issues."}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                            <form id="complaint-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setType(ComplaintType.PRIVATE)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group",
                                                type === ComplaintType.PRIVATE
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex flex-col gap-2 relative z-10">
                                                <Lock className={cn("h-5 w-5", type === ComplaintType.PRIVATE ? "text-slate-200" : "text-slate-400")} />
                                                <div>
                                                    <span className="block text-xs font-black uppercase tracking-wider">Private</span>
                                                    <span className="text-[10px] opacity-70 font-medium text-nowrap">Only Admins can see</span>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType(ComplaintType.PUBLIC)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group",
                                                type === ComplaintType.PUBLIC
                                                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-blue-100 hover:bg-blue-50/50"
                                            )}
                                        >
                                            <div className="flex flex-col gap-2 relative z-10">
                                                <Globe className={cn("h-5 w-5", type === ComplaintType.PUBLIC ? "text-blue-200" : "text-slate-400")} />
                                                <div>
                                                    <span className="block text-xs font-black uppercase tracking-wider">Public</span>
                                                    <span className="text-[10px] opacity-70 font-medium text-nowrap">Visible to everyone</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Details</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What's the issue? (e.g. Leaking Tap)"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all placeholder:text-slate-400"
                                        required
                                    />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide more details..."
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
                                        required
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className="space-y-3 pb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <ImageIcon className="h-3 w-3" />
                                        Attachment (Optional)
                                    </label>

                                    {uploadedUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video group">
                                            <S3Image
                                                src={uploadedUrl}
                                                alt="Uploaded attachment"
                                                className="w-full h-full object-cover"
                                                containerClassName="w-full h-full"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => resetUpload()}
                                                    className="px-4 py-2 bg-white text-rose-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                disabled={uploading}
                                            />
                                            <div className={cn(
                                                "w-full px-6 py-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-all",
                                                uploading
                                                    ? "bg-slate-50 border-slate-200"
                                                    : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                                            )}>
                                                {uploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                                ) : (
                                                    <Upload className="h-6 w-6 text-slate-400" />
                                                )}
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    {uploading ? "Uploading..." : "Click to Upload Image"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-8 border-t border-slate-50 sticky bottom-0 bg-white z-20">
                            <button
                                type="submit"
                                form="complaint-form"
                                disabled={isSubmitting || uploading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {isEditMode ? "Update Complaint" : "Submit Complaint"}
                                        {isEditMode ? <Pencil className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
