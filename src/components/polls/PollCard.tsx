'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Users,
  Timer,
  Info,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { formatDistanceToNow } from 'date-fns';
import PollResultsModal from './PollResultsModal';

interface PollProps {
  poll: {
    id: string;
    question: string;
    description?: string | null;
    isAnonymous: boolean;
    endsAt?: string | null;
    createdAt: string;
    options: Array<{
      id: string;
      text: string;
      _count?: { votes: number };
    }>;
    votes?: Array<{ userId: string; optionId: string }>;
    isPinned?: boolean;
  };
  currentUserId: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PollCard({
  poll: initialPoll,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
}: PollProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [userVote, setUserVote] = useState<string | null>(
    initialPoll.votes?.find((v) => v.userId === currentUserId)?.optionId || null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(
    !!userVote ||
      !!(initialPoll.endsAt && new Date(initialPoll.endsAt) < new Date())
  );
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(initialPoll.isPinned || false);
  const [isPinning, setIsPinning] = useState(false);

  const totalVotes = poll.options.reduce(
    (acc, opt) => acc + (opt._count?.votes || 0),
    0
  );
  const isExpired = !!(poll.endsAt && new Date(poll.endsAt) < new Date());

  useEffect(() => {
    const channel = pusherClient.subscribe(`poll-${poll.id}`);

    channel.bind('vote-updated', (data: { pollId: string; options: any[] }) => {
      setPoll((prev) => ({
        ...prev,
        options: prev.options.map((opt) => {
          const update = data.options.find((o) => o.id === opt.id);
          return update ? { ...opt, _count: { votes: update.count } } : opt;
        }),
      }));
    });

    return () => {
      pusherClient.unsubscribe(`poll-${poll.id}`);
    };
  }, [poll.id]);

  const togglePin = async () => {
    setIsPinning(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      if (res.ok) {
        setIsPinned(!isPinned);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPinning(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (isVoting || isExpired) return;

    setIsVoting(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      if (res.ok) {
        setUserVote(optionId);
        setShowResults(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="leading-tight font-black text-gray-900">
                {poll.question}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  Community Poll
                </span>
                {poll.isAnonymous && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                    <Info className="h-2.5 w-2.5" />
                    Anonymous
                  </span>
                )}
                {isPinned && (
                  <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-600 uppercase">
                    <Pin className="h-2.5 w-2.5 fill-amber-600" />
                    Pinned
                  </span>
                )}
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={togglePin}
                disabled={isPinning}
                className={cn(
                  'group rounded-full p-2 transition-all',
                  isPinned
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500'
                )}
                title={isPinned ? 'Unpin poll' : 'Pin poll'}
              >
                <Pin className={cn('h-4 w-4', isPinned && 'fill-amber-600')} />
              </button>
              <button
                onClick={onEdit}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-blue-600"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {poll.description && (
          <p className="mb-6 text-sm leading-relaxed font-medium text-gray-500">
            {poll.description}
          </p>
        )}

        <div className="space-y-3">
          {poll.options.map((option) => {
            const voteCount = option._count?.votes || 0;
            const percentage =
              totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isSelected = userVote === option.id;

            return (
              <button
                key={option.id}
                disabled={isVoting || isExpired || (showResults && !isExpired)}
                onClick={() => handleVote(option.id)}
                className={cn(
                  'relative w-full overflow-hidden rounded-2xl border transition-all duration-300',
                  showResults ? 'py-4 text-left' : 'py-3 text-center font-bold',
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30'
                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-100',
                  isVoting && 'cursor-not-allowed opacity-50'
                )}
              >
                {/* Progress Bar Background */}
                {showResults && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'absolute inset-y-0 left-0 z-0',
                      isSelected ? 'bg-blue-600/10' : 'bg-gray-200/30'
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'text-sm',
                        isSelected
                          ? 'font-black text-blue-700'
                          : 'font-bold text-gray-700'
                      )}
                    >
                      {option.text}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>

                  {showResults && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">
                        {Math.round(percentage)}%
                      </span>
                      <span className="text-[10px] font-bold tracking-tighter text-gray-400 uppercase">
                        ({voteCount})
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
              </span>
            </div>
            {poll.endsAt && (
              <div
                className={cn(
                  'flex items-center gap-1.5',
                  isExpired ? 'text-rose-500' : 'text-gray-400'
                )}
              >
                <Timer className="h-4 w-4" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  {isExpired
                    ? 'Ended'
                    : `Ends ${formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}`}
                </span>
              </div>
            )}
          </div>

          {!userVote && !isExpired && !showResults && (
            <button
              onClick={() => setShowResults(true)}
              className="text-[10px] font-black tracking-widest text-blue-600 uppercase transition-colors hover:text-blue-800"
            >
              View Results
            </button>
          )}

          {showResults && (!poll.isAnonymous || isAdmin) && (
            <button
              onClick={() => setIsResultsModalOpen(true)}
              className="text-[10px] font-black tracking-widest text-blue-600 uppercase transition-colors hover:text-blue-800"
            >
              View Detailed Results
            </button>
          )}
        </div>
      </div>

      <PollResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        pollId={poll.id}
      />
    </div>
  );
}
