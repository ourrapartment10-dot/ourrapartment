import { useState, useEffect, useRef, useCallback } from 'react';
import { extractS3Key, fetchSignedUrl, createS3UrlCache } from '@/lib/s3-utils';

/**
 * Hook for fetching and caching signed URLs for S3 images
 * @param imageUrls - Array of S3 URLs or single S3 URL
 * @param enabled - Whether to fetch signed URLs (default: true)
 * @returns Object with signed URLs, loading state, and error state
 */
export function useS3SignedUrls(
    imageUrls: string | string[] | null | undefined,
    enabled: boolean = true
) {
    const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create cache instance (persists across re-renders)
    const cache = useRef(createS3UrlCache(14)).current;

    const urls = Array.isArray(imageUrls)
        ? imageUrls.filter(Boolean)
        : imageUrls
            ? [imageUrls]
            : [];

    useEffect(() => {
        if (!enabled || urls.length === 0) {
            setLoading(false);
            return;
        }

        const fetchUrls = async () => {
            setLoading(true);
            setError(null);
            const results: Record<string, string | null> = {};

            try {
                await Promise.all(
                    urls.map(async (url) => {
                        // Check cache first
                        const cachedUrl = cache.get(url);
                        if (cachedUrl) {
                            results[url] = cachedUrl;
                            return;
                        }

                        // Fetch signed URL
                        const key = extractS3Key(url);
                        if (!key) {
                            results[url] = null;
                            return;
                        }

                        const signedUrl = await fetchSignedUrl(key);
                        results[url] = signedUrl;

                        // Cache the result
                        if (signedUrl) {
                            cache.set(url, signedUrl);
                        }
                    })
                );

                setSignedUrls(results);
            } catch (err) {
                console.error('Error fetching signed URLs:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch signed URLs');
            } finally {
                setLoading(false);
            }
        };

        fetchUrls();
    }, [JSON.stringify(urls), enabled]);

    return {
        signedUrls,
        loading,
        error,
        // Helper to get signed URL for a specific original URL
        getSignedUrl: useCallback((url: string) => signedUrls[url] || null, [signedUrls]),
    };
}

/**
 * Hook for uploading files to S3
 * @param folder - S3 folder to upload to
 * @returns Upload function, loading state, error, and uploaded URL
 */
export function useS3Upload(folder: string) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const upload = useCallback(async (file: File): Promise<string | null> => {
        setUploading(true);
        setError(null);
        setUploadedUrl(null);

        try {
            // Generate unique filename
            const extension = file.name.split(".").pop() || "jpg";
            const fileName = `${crypto.randomUUID()}.${extension}`;

            // Create FormData
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", fileName);
            formData.append("folder", folder);

            // Upload
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload file");
            }

            const { url } = await response.json();
            setUploadedUrl(url);
            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            console.error("Error uploading to S3:", err);
            return null;
        } finally {
            setUploading(false);
        }
    }, [folder]);

    const reset = useCallback(() => {
        setUploadedUrl(null);
        setError(null);
    }, []);

    return {
        upload,
        uploading,
        error,
        uploadedUrl,
        reset,
        setUrl: setUploadedUrl
    };
}

/**
 * Hook for managing a single S3 image with signed URL
 * @param imageUrl - S3 URL
 * @returns Signed URL, loading state, and error
 */
export function useS3Image(imageUrl: string | null | undefined) {
    const { signedUrls, loading, error, getSignedUrl } = useS3SignedUrls(imageUrl);

    return {
        signedUrl: imageUrl ? getSignedUrl(imageUrl) : null,
        loading,
        error
    };
}
