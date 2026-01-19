# Modular S3 Implementation Guide

## Overview
This document describes the production-grade, modular S3 implementation for the OurrApartment application. The implementation is designed to be reusable, maintainable, and scalable across the entire application.

## Architecture

### Core Utilities (`src/lib/s3-utils.ts`)
Provides low-level utility functions for S3 operations:

- **`extractS3Key(url: string)`** - Extracts S3 key from full URL
- **`isImageFile(fileName: string)`** - Validates if file is an image
- **`fetchSignedUrl(key: string)`** - Fetches signed URL for a single S3 object
- **`fetchSignedUrls(urls: string[])`** - Batch fetches signed URLs
- **`uploadToS3(file: File, folder: string)`** - Uploads file to S3
- **`validateFile(file: File, options)`** - Validates file before upload
- **`createS3UrlCache(expirationMinutes)`** - Creates URL cache manager

### Server-Side Utilities (`src/lib/s3-server.ts`)
Server-only functions for S3 operations (API routes only):

- **`deleteFromS3(key: string)`** - Deletes object from S3 by key
- **`deleteFromS3ByUrl(url: string)`** - Deletes object from S3 by URL
- **`extractS3KeyFromUrl(url: string)`** - Extracts S3 key from URL (server-side)
- **`deleteMultipleFromS3(keys: string[])`** - Deletes multiple objects by keys
- **`deleteMultipleFromS3ByUrl(urls: string[])`** - Deletes multiple objects by URLs

### React Hooks (`src/hooks/useS3.ts`)
Provides React hooks for S3 operations with state management:

- **`useS3SignedUrls(imageUrls, enabled)`** - Fetches and caches signed URLs
- **`useS3Upload(folder)`** - Manages file upload state
- **`useS3Image(imageUrl)`** - Simplified hook for single image

### React Components (`src/components/common/S3Image.tsx`)
Reusable component for displaying S3 images:

- **`<S3Image />`** - Auto-fetches signed URLs and handles loading/error states

## Usage Examples

### 1. Uploading Files

```tsx
import { useS3Upload } from '@/hooks/useS3';
import { validateFile } from '@/lib/s3-utils';

function MyComponent() {
    const { upload, uploading, uploadedUrl, error, reset } = useS3Upload('announcement-attachments');

    const handleFileSelect = async (file: File) => {
        // Validate first
        const validationError = validateFile(file, {
            maxSizeMB: 5,
            allowedTypes: ['image/jpeg', 'image/png']
        });

        if (validationError) {
            alert(validationError);
            return;
        }

        // Upload
        const url = await upload(file);
        if (url) {
            console.log('Uploaded to:', url);
        }
    };

    return (
        <div>
            {uploading && <p>Uploading...</p>}
            {error && <p>Error: {error}</p>}
            {uploadedUrl && <p>Success! URL: {uploadedUrl}</p>}
        </div>
    );
}
```

### 2. Displaying S3 Images

```tsx
import S3Image from '@/components/common/S3Image';

function MyComponent({ imageUrl }: { imageUrl: string }) {
    return (
        <S3Image
            src={imageUrl}
            alt="My Image"
            className="w-full h-64 object-cover"
            showLoader={true}
        />
    );
}
```

### 3. Fetching Multiple Signed URLs

```tsx
import { useS3SignedUrls } from '@/hooks/useS3';

function Gallery({ images }: { images: string[] }) {
    const { signedUrls, loading, getSignedUrl } = useS3SignedUrls(images);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {images.map(img => (
                <img key={img} src={getSignedUrl(img) || ''} alt="" />
            ))}
        </div>
    );
}
```

### 4. Using Low-Level Utilities

```tsx
import { extractS3Key, fetchSignedUrl } from '@/lib/s3-utils';

async function processImage(s3Url: string) {
    const key = extractS3Key(s3Url);
    if (!key) return null;

    const signedUrl = await fetchSignedUrl(key);
    return signedUrl;
}
```

## API Endpoints

### Upload Endpoint (`/api/upload`)
**Method**: POST  
**Body**: FormData with:
- `file`: File object
- `fileName`: Unique filename
- `folder`: S3 folder path

**Response**:
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/folder/file.jpg"
}
```

### Signed URL Endpoint (`/api/s3-signed-url`)
**Method**: GET  
**Query**: `key=folder/file.jpg`

**Response**:
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/folder/file.jpg?X-Amz-..."
}
```

## Caching Strategy

### Automatic Caching
- Signed URLs are cached for 14 minutes (signed URLs expire in 15 minutes)
- Cache is managed automatically by hooks
- Cache persists across component re-renders
- Cache is cleared when component unmounts

### Manual Cache Control
```tsx
const cache = createS3UrlCache(14);

// Get cached URL
const url = cache.get('my-key');

// Set URL in cache
cache.set('my-key', 'https://...');

// Clear specific entry
cache.delete('my-key');

// Clear all cache
cache.clear();
```

## Error Handling

### Upload Errors
```tsx
const { upload, error } = useS3Upload('folder');

const handleUpload = async (file: File) => {
    const url = await upload(file);
    if (!url) {
        console.error('Upload failed:', error);
        // Handle error
    }
};
```

### Display Errors
```tsx
<S3Image
    src={imageUrl}
    alt="Image"
    fallbackSrc="https://placehold.co/600x400?text=Error"
    onError={() => console.log('Image failed to load')}
/>
```

## Production Considerations

### 1. Security
- ✅ All API endpoints require authentication
- ✅ File validation before upload
- ✅ Signed URLs expire after 15 minutes
- ✅ No ACLs used (bucket owner enforced)

### 2. Performance
- ✅ Automatic caching reduces API calls
- ✅ Batch fetching for multiple URLs
- ✅ Lazy loading with loading states
- ✅ Error boundaries for graceful failures

### 3. Scalability
- ✅ Modular design allows easy extension
- ✅ Reusable across entire application
- ✅ Type-safe with TypeScript
- ✅ Consistent error handling

### 4. Maintainability
- ✅ Single source of truth for S3 logic
- ✅ Well-documented utilities
- ✅ Separation of concerns
- ✅ Easy to test

## Migration Guide

### From Old Implementation
```tsx
// OLD
const [imageUrl, setImageUrl] = useState(null);
const [signedUrl, setSignedUrl] = useState(null);
useEffect(() => {
    // Manual fetch logic...
}, [imageUrl]);

// NEW
const { signedUrl, loading } = useS3Image(imageUrl);
```

### From Direct URLs
```tsx
// OLD
<img src={s3Url} alt="Image" />

// NEW
<S3Image src={s3Url} alt="Image" />
```

## Future Enhancements

1. **Image Optimization**
   - Add automatic image compression before upload
   - Generate multiple sizes (thumbnail, medium, large)
   - WebP conversion for better performance

2. **Progress Tracking**
   - Add upload progress percentage
   - Implement resumable uploads for large files

3. **Batch Operations**
   - Bulk upload support
   - Batch delete functionality

4. **Advanced Caching**
   - IndexedDB for persistent cache
   - Service Worker integration
   - Offline support

## Troubleshooting

### Images Not Loading
1. Check if signed URL is being fetched (Network tab)
2. Verify S3 bucket permissions
3. Check CORS configuration
4. Ensure AWS credentials are valid

### Upload Failures
1. Check file size and type validation
2. Verify AWS credentials in `.env`
3. Check S3 bucket exists and is accessible
4. Review server logs for detailed errors

### Cache Issues
1. Clear browser cache
2. Check cache expiration time
3. Verify cache key consistency

## Testing

### Unit Tests
```typescript
import { extractS3Key, validateFile } from '@/lib/s3-utils';

describe('S3 Utils', () => {
    test('extracts S3 key correctly', () => {
        const url = 'https://bucket.s3.region.amazonaws.com/folder/file.jpg';
        expect(extractS3Key(url)).toBe('folder/file.jpg');
    });

    test('validates file size', () => {
        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        const error = validateFile(file, { maxSizeMB: 0.000001 });
        expect(error).toContain('exceeds');
    });
});
```

### Integration Tests
```typescript
import { useS3Upload } from '@/hooks/useS3';
import { renderHook, act } from '@testing-library/react-hooks';

test('uploads file successfully', async () => {
    const { result } = renderHook(() => useS3Upload('test-folder'));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
        await result.current.upload(file);
    });

    expect(result.current.uploadedUrl).toBeTruthy();
    expect(result.current.error).toBeNull();
});
```

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in source files
3. Check console for error messages
4. Review S3 bucket configuration

## Changelog

### v1.0.0 (2026-01-17)
- Initial modular implementation
- Created core utilities
- Added React hooks
- Created S3Image component
- Implemented caching strategy
- Added comprehensive documentation
