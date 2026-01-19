'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Send,
  Globe,
  Lock,
  Upload,
  Image as ImageIcon,
  Trash2,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplaintType } from '@/generated/client';
import { createComplaint, updateComplaint } from '@/app/actions/complaints';
import { cn } from '@/lib/utils';
import { useS3Upload } from '@/hooks/useS3';
import S3Image from '@/components/common/S3Image';

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  complaintToEdit?: any; // If provided, mode is 'edit'
}

export default function CreateComplaintModal({
  isOpen,
  onClose,
  onSuccess,
  complaintToEdit,
}: CreateComplaintModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ComplaintType>(ComplaintType.PRIVATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload State
  const {
    upload,
    uploading,
    uploadedUrl,
    reset: resetUpload,
    setUrl,
  } = useS3Upload('complaints');

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
        setTitle('');
        setDescription('');
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
          images: uploadedUrl ? [uploadedUrl] : [],
        });
      } else {
        await createComplaint({
          title,
          description,
          type,
          images: uploadedUrl ? [uploadedUrl] : [],
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit complaint', error);
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
            className="fixed inset-0 z-[100] h-screen w-screen bg-slate-900/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-[110] flex max-h-[90vh] w-[98%] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-50 bg-white p-8">
              <div>
                <h2 className="text-2xl leading-tight font-black text-slate-900">
                  {isEditMode ? 'Edit Complaint' : 'Raise a Complaint'}
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  {isEditMode
                    ? 'Update the details of your issue.'
                    : 'We are here to help resolve your issues.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-8">
              <form
                id="complaint-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType(ComplaintType.PRIVATE)}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300',
                        type === ComplaintType.PRIVATE
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <div className="relative z-10 flex flex-col gap-2">
                        <Lock
                          className={cn(
                            'h-5 w-5',
                            type === ComplaintType.PRIVATE
                              ? 'text-slate-200'
                              : 'text-slate-400'
                          )}
                        />
                        <div>
                          <span className="block text-xs font-black tracking-wider uppercase">
                            Private
                          </span>
                          <span className="text-[10px] font-medium text-nowrap opacity-70">
                            Only Admins can see
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType(ComplaintType.PUBLIC)}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300',
                        type === ComplaintType.PUBLIC
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-blue-100 hover:bg-blue-50/50'
                      )}
                    >
                      <div className="relative z-10 flex flex-col gap-2">
                        <Globe
                          className={cn(
                            'h-5 w-5',
                            type === ComplaintType.PUBLIC
                              ? 'text-blue-200'
                              : 'text-slate-400'
                          )}
                        />
                        <div>
                          <span className="block text-xs font-black tracking-wider uppercase">
                            Public
                          </span>
                          <span className="text-[10px] font-medium text-nowrap opacity-70">
                            Visible to everyone
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    Details
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's the issue? (e.g. Leaking Tap)"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                    required
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                    required
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-3 pb-4">
                  <label className="ml-1 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    <ImageIcon className="h-3 w-3" />
                    Attachment (Optional)
                  </label>

                  {uploadedUrl ? (
                    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-100">
                      <S3Image
                        src={uploadedUrl}
                        alt="Uploaded attachment"
                        className="h-full w-full object-cover"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => resetUpload()}
                          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-600 transition-transform hover:scale-105"
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
                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                        disabled={uploading}
                      />
                      <div
                        className={cn(
                          'flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-all',
                          uploading
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        ) : (
                          <Upload className="h-6 w-6 text-slate-400" />
                        )}
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                          {uploading ? 'Uploading...' : 'Click to Upload Image'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 border-t border-slate-50 bg-white p-8">
              <button
                type="submit"
                form="complaint-form"
                disabled={isSubmitting || uploading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-xs font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isEditMode ? 'Update Complaint' : 'Submit Complaint'}
                    {isEditMode ? (
                      <Pencil className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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
