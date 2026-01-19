'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  Trash2,
  X,
  Pin,
  Edit2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pusherClient } from '@/lib/pusher';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import MentionAutocomplete from '@/components/common/MentionAutocomplete';
import PollCard from '../polls/PollCard';
import { UserRole, isAdmin as checkIsAdmin } from '@/lib/enums';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface PostProps {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  signedImageUrl?: string | null;
  loadingImage?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  initialLikes: boolean;
  initialLikeCount: number;
  initialComments: Comment[];
  initialCommentsEnabled: boolean;
  isPinned?: boolean;
  expiresAt?: string | null;
  currentUserRole: string;
  onDelete?: () => void;
  onEdit?: () => void;
  poll?: any;
  currentUserId: string;
}

export default function PostCard({
  id,
  title,
  content,
  imageUrl,
  signedImageUrl,
  loadingImage = false,
  createdAt,
  author,
  initialLikes,
  initialLikeCount,
  initialComments,
  initialCommentsEnabled,
  isPinned: initialIsPinned = false,
  expiresAt,
  currentUserRole,
  onDelete,
  onEdit,
  poll,
  currentUserId,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(initialLikes);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentsEnabled, setCommentsEnabled] = useState(
    initialCommentsEnabled
  );
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isPinning, setIsPinning] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isModalImageLoading, setIsModalImageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scroll functionality
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const isAdmin = checkIsAdmin(currentUserRole);

  // Auto-scroll to bottom when comments change or modal opens
  useEffect(() => {
    if (showComments && !isUserScrolling) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [comments.length, showComments, isUserScrolling]);

  // Track user scrolling
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    setIsUserScrolling(!isAtBottom);
  };

  // Reset modal image loading state when it closes
  useEffect(() => {
    if (!isImageModalOpen) {
      setIsModalImageLoading(true);
    }
  }, [isImageModalOpen]);

  const toggleMute = async () => {
    setIsModerating(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentsEnabled: !commentsEnabled }),
      });
      if (res.ok) {
        setCommentsEnabled(!commentsEnabled);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsModerating(false);
    }
  };

  const togglePin = async () => {
    setIsPinning(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      if (res.ok) {
        setIsPinned(!isPinned);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete?.();
      } else {
        setError('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = pusherClient.subscribe(`announcement-${id}`);

    channel.bind('new-comment', (comment: Comment) => {
      setComments((prev) => {
        // Check if comment already exists to prevent duplicates
        const exists = prev.some((c) => c.id === comment.id);
        if (exists) {
          return prev;
        }
        return [...prev, comment];
      });
    });

    // Listen for stats updates (likes)
    // Only update count if triggerer wasn't us (tough to filter without socketId, but usually okay for simple count)
    channel.bind('stats-update', (data: { likeCount: number }) => {
      setLikeCount(data.likeCount);
      // Note: We don't overwrite isLiked because that's local user state
    });

    return () => {
      pusherClient.unsubscribe(`announcement-${id}`);
    };
  }, [id]);

  const handleLike = async () => {
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await fetch(`/api/announcements/${id}/like`, { method: 'POST' });
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.error(error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentsEnabled) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/announcements/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          mentionedUserIds: mentionedUsers.map((u) => u.id),
        }),
      });

      if (res.ok) {
        setNewComment('');
        setMentionedUsers([]); // Clear mentioned users
        setIsUserScrolling(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
            {author.image ? (
              <Image
                src={author.image}
                alt={author.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-600">
                {author.name[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{author.name}</h3>
              {author.role === 'ADMIN' || author.role === 'SUPER_ADMIN' ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  Admin
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          {isPinned && (
            <div className="ml-2 flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-amber-600">
              <Pin className="h-2.5 w-2.5 fill-amber-600" />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                Pinned
              </span>
            </div>
          )}
        </div>

        {/* Moderation Controls for Admins */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={togglePin}
              disabled={isPinning}
              className={cn(
                'group rounded-full p-2 transition-colors hover:bg-amber-50',
                isPinned ? 'bg-amber-50/50 text-amber-600' : 'text-gray-400'
              )}
              title={isPinned ? 'Unpin from top' : 'Pin to top'}
            >
              {isPinning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pin
                  className={cn(
                    'h-4 w-4 group-hover:text-amber-600',
                    isPinned && 'fill-amber-600'
                  )}
                />
              )}
            </button>
            <button
              onClick={() => onEdit?.()}
              className="group rounded-full p-2 transition-colors hover:bg-blue-50"
              title="Edit announcement"
            >
              <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="group rounded-full p-2 transition-colors hover:bg-red-50"
              title="Delete announcement"
            >
              <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
            </button>
            <button
              onClick={toggleMute}
              disabled={isModerating}
              className={cn(
                'rounded-full p-2 transition-colors hover:bg-gray-50',
                commentsEnabled ? 'text-gray-600' : 'text-orange-600'
              )}
              title={commentsEnabled ? 'Mute comments' : 'Unmute comments'}
            >
              {isModerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : commentsEnabled ? (
                <MessageCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Media */}
      {imageUrl && (
        <div
          className="relative aspect-video w-full cursor-pointer bg-gray-50"
          onClick={() => setIsImageModalOpen(true)}
        >
          {(loadingImage || !signedImageUrl || isImageLoading) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-xs font-medium text-gray-500">
                  Loading image...
                </span>
              </div>
            </div>
          )}
          {signedImageUrl && (
            <img
              src={signedImageUrl}
              alt={title}
              className={cn(
                'h-full w-full object-cover transition-all duration-500',
                isImageLoading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              )}
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                console.error('Image failed to load');
                setIsImageLoading(false);
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400?text=Failed+to+Load';
              }}
            />
          )}
        </div>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5"
          >
            <div className="mt-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-mono text-xs font-bold">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="rounded-full p-1 transition-colors hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-5">
        <h2 className="mb-2 text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
          {content}
        </p>
      </div>

      {/* Poll */}
      {poll && (
        <div className="mb-4 px-5">
          <PollCard
            poll={poll}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            // For now we don't have separate edit/delete for polls within posts
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-4">
        <div className="mb-4 flex items-center gap-4 sm:gap-6">
          <button
            onClick={handleLike}
            className="group flex items-center gap-2 outline-none"
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors sm:h-7 sm:w-7',
                  isLiked
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
            </motion.div>
            {likeCount > 0 && (
              <span className="text-xs font-bold text-gray-700 sm:text-sm">
                {likeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="group flex items-center gap-2 outline-none"
          >
            <MessageCircle className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500 sm:h-7 sm:w-7" />
            {comments.length > 0 && (
              <span className="text-xs font-bold text-gray-700 sm:text-sm">
                {comments.length}
              </span>
            )}
          </button>
        </div>

        {/* Like Details */}
        {likeCount > 0 && (
          <p className="mb-2 text-xs font-medium text-gray-500">
            Liked by{' '}
            <span className="font-bold text-gray-900">
              {likeCount} residents
            </span>
          </p>
        )}

        {/* Comments Preview */}
        {comments.length > 0 && (
          <button
            onClick={() => setShowComments(true)}
            className="mb-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            View all {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Instagram-Style Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 bottom-0 left-0 z-[90] flex max-h-[70vh] flex-col rounded-t-3xl bg-white shadow-2xl"
            >
              {/* Handle Bar */}
              <div className="flex items-center justify-center border-b border-gray-100 py-3">
                <div className="h-1 w-12 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="font-bold text-gray-900">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Comments List - Scrollable, latest at bottom */}
              <div
                ref={commentsContainerRef}
                onScroll={handleScroll}
                className="flex-1 space-y-4 overflow-y-auto px-4 py-3"
              >
                {comments.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="mb-3 h-16 w-16 text-gray-300" />
                    <p className="font-medium text-gray-500">No comments yet</p>
                    <p className="text-sm text-gray-400">
                      Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <>
                    {comments.map((comment, index) => (
                      <div
                        key={`${comment.id}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
                          {comment.user.image ? (
                            <Image
                              src={comment.user.image}
                              alt={comment.user.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-bold text-gray-600">
                              {comment.user.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-baseline gap-2">
                            <p className="text-sm font-bold text-gray-900">
                              {comment.user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(comment.createdAt))}{' '}
                              ago
                            </p>
                          </div>
                          <p className="text-sm break-words text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Invisible div for scrolling to bottom */}
                    <div ref={commentsEndRef} />
                  </>
                )}
              </div>

              {/* Comment Input - Fixed at bottom */}
              {commentsEnabled ? (
                <div className="border-t border-gray-100 bg-white p-4">
                  <form
                    onSubmit={handleComment}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-md">
                      You
                    </div>
                    <MentionAutocomplete
                      value={newComment}
                      onChange={setNewComment}
                      onSubmit={() => {
                        if (newComment.trim() && !isSubmittingComment) {
                          handleComment(new Event('submit') as any);
                        }
                      }}
                      onMentionAdded={(userId, userName) => {
                        setMentionedUsers((prev) => {
                          // Avoid duplicates
                          if (prev.some((u) => u.id === userId)) return prev;
                          return [...prev, { id: userId, name: userName }];
                        });
                      }}
                      disabled={isSubmittingComment}
                      placeholder="Add a comment... (use @ to mention)"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="flex-shrink-0 p-2 text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      {isSubmittingComment ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>Comments have been disabled by an admin</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Modal (Simple) */}
      {isImageModalOpen && signedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-4xl items-center justify-center">
            {isModalImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
            )}
            <img
              src={signedImageUrl}
              alt={title}
              className={cn(
                'h-full w-full object-contain transition-opacity duration-300',
                isModalImageLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsModalImageLoading(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}
