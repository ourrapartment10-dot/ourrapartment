'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Send,
  Loader2,
  Plus,
  Trash2,
  BarChart3,
  Eye,
  Edit3,
  MessageCircle,
  Heart,
  Pin,
  Calendar,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useS3Upload } from '@/hooks/useS3';
import { validateFile } from '@/lib/s3-utils';
import S3Image from '@/components/common/S3Image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: any;
  editData?: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    commentsEnabled: boolean;
    expiresAt?: string | null;
    poll?: any;
  } | null;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  user,
}: CreateAnnouncementModalProps) {
  const formatDateForInput = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return '';
    try {
      const date = new Date(dateVal);
      if (!isNaN(date.getTime())) {
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        return localDate.toISOString().substring(0, 16);
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    return '';
  };

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState(editData?.title || '');
  const [content, setContent] = useState(editData?.content || '');
  const [commentsEnabled, setCommentsEnabled] = useState(
    editData?.commentsEnabled ?? true
  );
  const [expiresAt, setExpiresAt] = useState(
    formatDateForInput(editData?.expiresAt)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll State
  const [hasPoll, setHasPoll] = useState(!!editData?.poll);
  const [pollQuestion, setPollQuestion] = useState(
    editData?.poll?.question || ''
  );
  const [pollOptions, setPollOptions] = useState<string[]>(
    editData?.poll?.options?.map((o: any) => o.text) || ['', '']
  );

  // Use S3 upload hook
  const {
    upload,
    uploading,
    uploadedUrl,
    reset: resetUpload,
    setUrl,
  } = useS3Upload('announcement-attachments');

  // Sync state when editData changes
  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setContent(editData.content);
      setCommentsEnabled(editData.commentsEnabled);
      setExpiresAt(formatDateForInput(editData.expiresAt));
      setHasPoll(!!editData.poll);
      setPollQuestion(editData.poll?.question || '');
      setPollOptions(
        editData.poll?.options?.map((o: any) => o.text) || ['', '']
      );

      if (editData.imageUrl) {
        setUrl(editData.imageUrl);
      } else {
        resetUpload();
      }
    } else if (isOpen) {
      setTitle('');
      setContent('');
      setCommentsEnabled(true);
      setExpiresAt('');
      setHasPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      resetUpload();
    }
  }, [editData, isOpen, setUrl, resetUpload]);

  const isEditing = !!editData;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/jfif',
      ],
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    await upload(file);
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    // Validate poll if enabled
    const filteredPollOptions = pollOptions.filter((opt) => opt.trim() !== '');
    if (hasPoll && (!pollQuestion || filteredPollOptions.length < 2)) {
      setError('Please provide a poll question and at least 2 options.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/announcements/${editData.id}`
        : '/api/announcements';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          imageUrl: uploadedUrl,
          commentsEnabled,
          expiresAt: expiresAt || null,
          poll: hasPoll
            ? {
                question: pollQuestion,
                options: filteredPollOptions,
                isAnonymous: false, // Default for integrated polls
              }
            : null,
        }),
      });

      if (res.ok) {
        if (!isEditing) {
          setTitle('');
          setContent('');
          setCommentsEnabled(true);
          setExpiresAt('');
          resetUpload();
        }
        onSuccess?.();
        onClose();
      } else {
        setError(`Failed to ${isEditing ? 'update' : 'create'} announcement.`);
      }
    } catch (error) {
      console.error(error);
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 z-[70] flex h-[90vh] w-[98%] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Custom Header */}
            <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-white/50 px-4 py-4 sm:flex-row sm:px-8 sm:py-6">
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 sm:h-12 sm:w-12">
                  <Edit3 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg leading-tight font-black tracking-tight text-gray-900 sm:text-2xl">
                    {isEditing ? 'Refine Post' : 'Compose Update'}
                  </h2>
                  <p className="text-[10px] leading-none font-bold tracking-widest text-gray-400 uppercase sm:text-sm">
                    Broadcasting to all
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="group rounded-full p-2 transition-colors hover:bg-gray-100 sm:hidden"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>

              <div className="flex w-full items-center gap-1 rounded-xl bg-gray-100/50 p-1 sm:w-auto sm:gap-2 sm:rounded-2xl">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all sm:flex-initial sm:rounded-xl sm:px-6 sm:text-sm',
                    activeTab === 'edit'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all sm:flex-initial sm:rounded-xl sm:px-6 sm:text-sm',
                    activeTab === 'preview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Live Preview
                </button>
              </div>

              <button
                onClick={onClose}
                className="group hidden rounded-full p-2 transition-colors hover:bg-gray-100 sm:block"
              >
                <X className="h-6 w-6 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-8"
                >
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-600">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">{error}</span>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="rounded-full p-1 transition-colors hover:bg-rose-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Body */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
              {/* Editor Pane */}
              <div
                className={cn(
                  'custom-scrollbar flex-1 overflow-y-auto bg-white p-8 transition-all duration-500',
                  activeTab === 'preview' &&
                    'pointer-events-none hidden scale-95 opacity-40 grayscale lg:block'
                )}
              >
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto max-w-3xl space-y-6 sm:space-y-8"
                >
                  {/* Essentials */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="group relative">
                      <label className="mb-2 block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase sm:mb-3">
                        Headline Content
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's the update about?"
                        className="w-full border-b-2 border-gray-100 bg-transparent px-0 py-2 text-2xl font-bold text-gray-900 transition-all outline-none placeholder:text-gray-200 focus:border-blue-600 sm:py-4 sm:text-3xl"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase sm:mb-3">
                        Detailed Message
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your announcement here..."
                        rows={5}
                        className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-base font-medium text-gray-900 transition-all outline-none placeholder:text-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 sm:rounded-3xl sm:px-6 sm:py-5 sm:text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Visual Attachment */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        Visual Attachment
                      </label>
                      <div className="group relative aspect-video overflow-hidden rounded-3xl border-2 border-dashed border-gray-100 transition-all hover:border-blue-400">
                        {!uploadedUrl ? (
                          <div
                            onClick={() =>
                              document
                                .getElementById('post-file-input')
                                ?.click()
                            }
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center transition-colors hover:bg-blue-50/50"
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="animate-pulse text-xs font-black text-blue-600">
                                  Uploading...
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 transition-transform group-hover:scale-110 group-hover:rotate-3">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-bold text-gray-400">
                                  Click to upload image
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="group h-full w-full">
                            <S3Image
                              src={uploadedUrl}
                              alt="Preview"
                              className="h-full w-full object-cover"
                              containerClassName="h-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={resetUpload}
                                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-red-600 transition-transform hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                                Replace
                              </button>
                            </div>
                          </div>
                        )}
                        <input
                          id="post-file-input"
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        Settings & Flow
                      </label>
                      <div className="space-y-3">
                        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-bold">
                              Auto-Expiration
                            </span>
                          </div>
                          <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-gray-900 transition-all outline-none focus:border-blue-600"
                          />
                          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Post will be hidden after this time
                          </p>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MessageCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-bold">
                                Resident Replies
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setCommentsEnabled(!commentsEnabled)
                              }
                              className={cn(
                                'relative h-6 w-12 rounded-full p-1 transition-all',
                                commentsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                              )}
                            >
                              <div
                                className={cn(
                                  'h-4 w-4 rounded-full bg-white transition-transform',
                                  commentsEnabled
                                    ? 'translate-x-6'
                                    : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Allow comments on this post
                          </p>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-700">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-bold">
                                Attach Poll
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHasPoll(!hasPoll)}
                              className={cn(
                                'relative h-6 w-12 rounded-full p-1 transition-all',
                                hasPoll ? 'bg-indigo-600' : 'bg-gray-300'
                              )}
                            >
                              <div
                                className={cn(
                                  'h-4 w-4 rounded-full bg-white transition-transform',
                                  hasPoll ? 'translate-x-6' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Add an interactive poll
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Poll Editor Section */}
                  <AnimatePresence>
                    {hasPoll && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 20 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 rounded-[2.5rem] border border-indigo-100 bg-indigo-50/50 p-8">
                          <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                              <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-black tracking-tight text-indigo-900">
                              Poll Configuration
                            </h3>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                                The Big Question
                              </label>
                              <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) =>
                                  setPollQuestion(e.target.value)
                                }
                                placeholder="e.g. Which date works best for all?"
                                className="w-full border-b-2 border-indigo-200 bg-transparent px-0 py-3 text-xl font-bold text-indigo-900 transition-all outline-none placeholder:text-indigo-200 focus:border-indigo-600"
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="mb-1 block text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                                Response Options
                              </label>
                              {pollOptions.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        handlePollOptionChange(
                                          idx,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Choice ${idx + 1}`}
                                      className="w-full rounded-2xl border border-indigo-100 bg-white px-5 py-3 font-bold text-indigo-900 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                                    />
                                    <span className="absolute top-1/2 left-[-1.5rem] -translate-y-1/2 text-[10px] font-black text-indigo-300">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  {pollOptions.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removePollOption(idx)}
                                      className="p-3 text-indigo-300 transition-colors hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {pollOptions.length < 10 && (
                                <button
                                  type="button"
                                  onClick={addPollOption}
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-100/50 py-3 text-xs font-black text-indigo-600 transition-all hover:bg-indigo-100"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Better Choice
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Preview Pane */}
              <div
                className={cn(
                  'custom-scrollbar flex-1 items-center justify-center overflow-y-auto bg-gray-50/50 p-8 transition-all duration-700 lg:flex lg:p-12',
                  activeTab === 'edit' ? 'hidden' : 'flex'
                )}
              >
                <div className="w-full max-w-md">
                  <div className="mb-10 text-center">
                    <span className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase">
                      Live Rendering
                    </span>
                  </div>

                  {/* Mock Post Card */}
                  <div className="scale-110 transform-gpu overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl lg:scale-125">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-blue-50 bg-blue-100">
                        {user?.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-blue-600">
                            {user?.name?.[0] || 'A'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900">
                            {user?.name || 'Admin Name'}
                          </h4>
                          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-black text-blue-600 uppercase">
                            Admin
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-medium text-gray-400">
                            Just now
                          </p>
                          {expiresAt && (
                            <span className="flex items-center gap-1 text-[8px] font-black tracking-tighter text-rose-500 uppercase">
                              <Timer className="h-2 w-2" />
                              Expires soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    {uploadedUrl ? (
                      <div className="relative aspect-video overflow-hidden bg-gray-50">
                        <S3Image
                          src={uploadedUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    )}

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="mb-1.5 leading-tight font-black text-gray-900">
                        {title || 'Your Epic Title Here'}
                      </h3>
                      <p className="line-clamp-3 text-xs leading-relaxed whitespace-pre-wrap text-gray-500">
                        {content ||
                          'Share something amazing with the community...'}
                      </p>
                    </div>

                    {/* Mock Poll */}
                    {hasPoll && (
                      <div className="px-5 pb-5">
                        <div className="rounded-2xl border border-indigo-50 bg-indigo-50/50 p-4">
                          <h4 className="mb-3 flex items-center gap-1.5 text-[10px] font-black tracking-wider text-indigo-900 uppercase">
                            <BarChart3 className="h-3 w-3" />
                            {pollQuestion || 'The Poll Question'}
                          </h4>
                          <div className="space-y-1.5">
                            {pollOptions.map(
                              (opt, idx) =>
                                opt.trim() && (
                                  <div
                                    key={idx}
                                    className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-[10px] font-bold text-indigo-700"
                                  >
                                    {opt}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactions */}
                    <div className="flex items-center gap-3 px-5 pb-4">
                      <Heart className="h-6 w-6 text-gray-300" />
                      <MessageCircle className="h-6 w-6 text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:px-8 sm:py-6">
              <button
                onClick={onClose}
                className="hidden text-sm font-black tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-900 sm:block"
              >
                Discard draft
              </button>

              <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
                {activeTab === 'preview' && (
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-black text-gray-900 transition-all hover:bg-gray-50 sm:flex-initial sm:rounded-2xl"
                  >
                    Back to Editor
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!title || !content || uploading || isSubmitting}
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gray-900 px-6 py-3.5 text-base font-black text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:flex-initial sm:rounded-2xl sm:px-10 sm:py-4 sm:text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isEditing ? 'Syncing...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>{isEditing ? 'Save' : 'Publish'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
