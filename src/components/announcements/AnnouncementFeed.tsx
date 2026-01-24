'use client';

import { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';
import { pusherClient } from '@/lib/pusher';
import CreateAnnouncementModal from './CreateAnnouncementModal';

export default function AnnouncementFeed({
  initialPosts,
  user,
}: {
  initialPosts: any[];
  user: any;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [signedImageUrls, setSignedImageUrls] = useState<
    Record<string, string | null>
  >({});
  const [loadingImages, setLoadingImages] = useState(true);
  const imageUrlCache = useRef<
    Record<string, { url: string | null; expiresAt: number }>
  >({});
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch signed URLs for images
  useEffect(() => {
    const fetchSignedUrls = async () => {
      setLoadingImages(true);
      const urls: Record<string, string | null> = {};
      const now = Date.now();

      // First pass: Use cached URLs if still valid
      for (const post of posts) {
        if (
          imageUrlCache.current[post.id] &&
          imageUrlCache.current[post.id].expiresAt > now
        ) {
          urls[post.id] = imageUrlCache.current[post.id].url;
        }
      }

      // Second pass: Fetch signed URLs for posts not in cache
      for (const post of posts) {
        if (urls[post.id] !== undefined) {
          continue; // Already cached
        }

        if (post.imageUrl) {
          try {
            const urlParts = post.imageUrl.split('/');
            const folder = urlParts[urlParts.length - 2];
            const fileName = urlParts[urlParts.length - 1];
            const key = `${folder}/${fileName}`;

            const response = await fetch(
              `/api/s3-signed-url?key=${encodeURIComponent(key)}`
            );
            if (response.ok) {
              const data = await response.json();
              urls[post.id] = data.url;
              // Cache with 14 minute expiration (signed URLs are valid for 15 min)
              imageUrlCache.current[post.id] = {
                url: data.url,
                expiresAt: now + 14 * 60 * 1000,
              };
            } else {
              console.error(`Failed to get signed URL for post ${post.id}`);
              urls[post.id] = null;
            }
          } catch (error) {
            console.error(
              `Error fetching signed URL for post ${post.id}:`,
              error
            );
            urls[post.id] = null;
          }
        } else {
          urls[post.id] = null;
        }
      }

      setSignedImageUrls(urls);
      setLoadingImages(false);
    };

    if (posts.length > 0) {
      fetchSignedUrls();
    } else {
      setLoadingImages(false);
    }
  }, [posts]);

  useEffect(() => {
    const channel = pusherClient.subscribe('announcements');

    channel.bind('new-post', (newPost: any) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => {
      pusherClient.unsubscribe('announcements');
    };
  }, []);

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-4xl">📢</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          No Announcements Yet
        </h3>
        <p className="text-gray-500">
          Stay tuned for updates from the administration.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
          imageUrl={post.imageUrl}
          signedImageUrl={signedImageUrls[post.id]}
          loadingImage={loadingImages}
          createdAt={post.createdAt}
          author={post.author}
          initialLikes={post.isLiked}
          initialLikeCount={post.likeCount}
          initialComments={post.comments}
          initialCommentsEnabled={post.commentsEnabled}
          currentUserRole={user.role}
          currentUserId={user.id}
          isPinned={post.isPinned}
          expiresAt={post.expiresAt}
          poll={post.poll}
          onDelete={() =>
            setPosts((prev) => prev.filter((p) => p.id !== post.id))
          }
          onEdit={() => {
            setEditingPost(post);
            setIsEditModalOpen(true);
          }}
        />
      ))}
      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      )}

      <CreateAnnouncementModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        onSuccess={() => {
          // Update the edited post in the list
          // Since it's a full refresh we might just want to trigger a fetch,
          // but for smooth UI let's just refresh the page or fetch new data.
          window.location.reload();
        }}
        editData={editingPost}
        user={user}
      />
    </div>
  );
}
