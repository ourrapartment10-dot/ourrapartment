import { useState } from 'react';
import { useS3Image } from '@/hooks/useS3';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface S3ImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    containerClassName?: string;
    fallbackSrc?: string;
    showLoader?: boolean;
    onError?: () => void;
    onClick?: () => void;
}

/**
 * Reusable component for displaying S3 images with automatic signed URL fetching
 * Handles loading states, errors, and fallbacks
 */
export default function S3Image({
    src,
    alt,
    className,
    containerClassName,
    fallbackSrc = "https://placehold.co/600x400?text=Failed+to+Load",
    showLoader = true,
    onError,
    onClick
}: S3ImageProps) {
    const { signedUrl, loading, error } = useS3Image(src);
    const [imageLoaded, setImageLoaded] = useState(false);

    // No image URL provided
    if (!src) {
        return null;
    }

    // Loading state
    if (loading && showLoader) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100", containerClassName)}>
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    // Error state or no signed URL
    if (error || !signedUrl) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100", containerClassName)}>
                <img
                    src={fallbackSrc}
                    alt={alt}
                    className={className}
                    onClick={onClick}
                />
            </div>
        );
    }

    // Success state

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {(!imageLoaded && showLoader) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
            )}
            <img
                src={signedUrl}
                alt={alt}
                className={cn(
                    className,
                    "transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onClick={onClick}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                    console.error("Image failed to load:", src);
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackSrc;
                    setImageLoaded(true); // Stop showing loader even on error
                    onError?.();
                }}
            />
        </div>
    );
}
