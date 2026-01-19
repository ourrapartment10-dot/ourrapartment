'use client';

import { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PollResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
}

export default function PollResultsModal({
  isOpen,
  onClose,
  pollId,
}: PollResultsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && pollId) {
      fetchResults();
    }
  }, [isOpen, pollId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/results`);
      if (res.ok) {
        const results = await res.json();
        setData(results);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-[110] flex max-h-[80vh] w-[95%] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:w-[90%]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900">
                  Voter Breakdown
                </h2>
                {data && (
                  <p className="text-sm font-medium text-gray-500">
                    {data.isAnonymous
                      ? 'Anonymous Poll - Voter identities hidden'
                      : 'Who voted for what'}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                    Loading voters...
                  </p>
                </div>
              ) : data ? (
                <div className="space-y-8">
                  {data.options.map((option: any) => (
                    <div key={option.id}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">
                          {option.text}
                        </h3>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                          {option.votes?.length || option.count || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {option.votes && option.votes.length > 0 ? (
                          option.votes.map((vote: any) => (
                            <div
                              key={vote.id}
                              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                            >
                              <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                                {vote.user.image ? (
                                  <Image
                                    src={vote.user.image}
                                    alt={vote.user.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-blue-100 text-xs font-bold text-blue-600 uppercase">
                                    {vote.user.name[0]}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold text-gray-700">
                                {vote.user.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="border-l-2 border-gray-100 py-2 pl-4 text-xs text-gray-400 italic">
                            {data.isAnonymous
                              ? 'Identities are hidden'
                              : 'No votes for this option yet'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-gray-400">
                  Failed to load results.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
