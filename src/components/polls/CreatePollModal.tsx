'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Info,
  BarChart3,
  Edit3,
  Eye,
  Send,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: any;
  editData?: any;
  announcementId?: string | null;
}

export default function CreatePollModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  editData,
  announcementId,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setQuestion(editData.question);
      setDescription(editData.description || '');
      setOptions(editData.options.map((opt: any) => opt.text));
      setIsAnonymous(editData.isAnonymous);
      setEndsAt(editData.endsAt ? editData.endsAt.substring(0, 16) : '');
    } else if (isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setQuestion('');
    setDescription('');
    setOptions(['', '']);
    setIsAnonymous(false);
    setEndsAt('');
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = options.filter((opt) => opt.trim() !== '');
    if (!question || filteredOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      const url = editData ? `/api/polls/${editData.id}` : '/api/polls';
      const method = editData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          description,
          options: filteredOptions,
          isAnonymous,
          endsAt: endsAt || null,
          announcementId,
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      } else {
        setError('Failed to save poll');
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 z-[110] flex h-[85vh] w-[98%] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-white/50 px-4 py-4 sm:flex-row sm:px-8 sm:py-6">
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 sm:h-12 sm:w-12">
                  <BarChart3 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg leading-tight font-black tracking-tight text-gray-900 sm:text-2xl">
                    {editData ? 'Refine Poll' : 'Launch Sentiment Poll'}
                  </h2>
                  <p className="text-[10px] leading-none font-bold tracking-widest text-gray-400 uppercase sm:text-sm">
                    Gathering community insights
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
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Configure
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all sm:flex-initial sm:rounded-xl sm:px-6 sm:text-sm',
                    activeTab === 'preview'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Vibe Check
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
                      <Info className="h-5 w-5" />
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

            {/* Content */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
              {/* Editor */}
              <div
                className={cn(
                  'custom-scrollbar flex-1 overflow-y-auto bg-white p-8 transition-all duration-500',
                  activeTab === 'preview' &&
                  'pointer-events-none hidden scale-95 opacity-40 grayscale lg:block'
                )}
              >
                <form
                  id="standalone-poll-form"
                  onSubmit={handleSubmit}
                  className="mx-auto max-w-2xl space-y-6 sm:space-y-8"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase sm:mb-3">
                        Poll Question
                      </label>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What is your question?"
                        className="w-full border-b-2 border-gray-100 bg-transparent px-0 py-2 text-xl font-bold text-gray-900 transition-all outline-none placeholder:text-gray-200 focus:border-purple-600 sm:py-4 sm:text-2xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase sm:mb-3">
                        Contextual Details
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add context..."
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-base font-medium text-gray-900 transition-all outline-none placeholder:text-gray-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/5 sm:rounded-3xl sm:px-6 sm:py-5 sm:text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                      Voting Options
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2"
                        >
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              placeholder={`Choice ${index + 1}`}
                              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 pl-12 font-bold text-gray-900 shadow-sm transition-all outline-none focus:border-purple-600 focus:shadow-md"
                              required
                            />
                            <span className="absolute top-1/2 left-5 -translate-y-1/2 text-xs font-black text-purple-300">
                              {index + 1}
                            </span>
                          </div>
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="rounded-2xl p-4 text-red-400 transition-all hover:bg-red-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {options.length < 10 && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-100 py-4 text-sm font-black text-purple-400 transition-all hover:border-purple-200 hover:bg-purple-50/50"
                        >
                          <Plus className="h-5 w-5" />
                          Add New Perspective
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2">
                    <div className="space-y-4 rounded-[2rem] border border-gray-100 bg-gray-50/50 p-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
                          Expiration Time
                        </span>
                      </div>
                      <input
                        type="datetime-local"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                        className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-all outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-[2rem] border border-gray-100 bg-gray-50/50 p-6">
                      <div>
                        <span className="mb-1 block text-[10px] font-black tracking-widest text-gray-900 uppercase">
                          Privacy Grade
                        </span>
                        <span className="block text-xs font-bold text-gray-400">
                          Anonymous Voting
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={cn(
                          'relative h-7 w-14 rounded-full p-1 transition-all',
                          isAnonymous ? 'bg-purple-600' : 'bg-gray-200'
                        )}
                      >
                        <div
                          className={cn(
                            'h-5 w-5 rounded-full bg-white shadow-lg transition-transform',
                            isAnonymous ? 'translate-x-7' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div
                className={cn(
                  'custom-scrollbar flex-1 items-center justify-center overflow-y-auto bg-indigo-50/30 p-8 transition-all duration-700 lg:flex lg:p-12',
                  activeTab === 'edit' ? 'hidden' : 'flex'
                )}
              >
                <div className="w-full max-w-md">
                  <div className="mb-8 text-center">
                    <span className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.4em] text-purple-500 uppercase">
                      <Sparkles className="h-3 w-3" />
                      Live Sentiment View
                    </span>
                  </div>

                  <div className="scale-110 transform-gpu space-y-6 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="leading-tight font-black text-gray-900">
                            {question || 'Question Placeholder'}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[9px] font-black tracking-widest text-purple-400 uppercase">
                              Live Poll
                            </span>
                            {isAnonymous && (
                              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-gray-500 uppercase">
                                Anonymous
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {description && (
                      <p className="text-xs leading-relaxed font-medium text-gray-500 italic">
                        {description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {options.map(
                        (opt, idx) =>
                          opt.trim() && (
                            <div
                              key={idx}
                              className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-xs font-black text-gray-700"
                            >
                              <span>{opt}</span>
                              <div className="h-4 w-4 rounded-full border-2 border-purple-200 transition-colors group-hover:border-purple-600" />
                            </div>
                          )
                      )}
                      <div className="flex items-center justify-between pt-4 text-gray-400">
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          0 Votes cast
                        </span>
                        {endsAt && (
                          <span className="text-[10px] font-bold">
                            Ends soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white p-4 sm:flex-row sm:p-8">
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
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-black text-gray-900 transition-all hover:bg-gray-100 sm:flex-initial sm:rounded-2xl"
                  >
                    Config Adjust
                  </button>
                )}

                <button
                  form="standalone-poll-form"
                  type="submit"
                  disabled={
                    !question ||
                    options.filter((o) => o.trim() !== '').length < 2 ||
                    isSubmitting
                  }
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gray-900 px-6 py-3.5 text-base font-black text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-300 sm:flex-initial sm:rounded-2xl sm:px-10 sm:py-4 sm:text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>{editData ? 'Update' : 'Launch'}</span>
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
