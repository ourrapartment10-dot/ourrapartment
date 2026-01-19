# S3 Implementation - Aligned with Reference Project

## Overview

The S3 upload and display flow has been updated to match the `community-management-main` reference project pattern.

## Architecture

### 1. Upload Flow

**Endpoint**: `/api/upload` (POST)

**Request Format**:

```typescript
FormData {
  file: File,
  fileName: string,  // UUID-based filename with extension
  folder: string     // "announcement-attachments"
}
```

**Response**:

```json
{
  "url": "https://ourrapartment.s3.ap-south-1.amazonaws.com/announcement-attachments/{uuid}.{ext}"
}
```

**Key Points**:

- File is uploaded directly to S3 from the server
- No ACL is set (bucket uses "Bucket owner enforced" setting)
- Returns the public S3 URL for database storage

### 2. Display Flow

**Endpoint**: `/api/s3-signed-url` (GET)

**Request Format**:

```
GET /api/s3-signed-url?key=announcement-attachments/{filename}
```

**Response**:

```json
{
  "url": "https://ourrapartment.s3.ap-south-1.amazonaws.com/announcement-attachments/{filename}?X-Amz-..."
}
```

**Key Points**:

- Generates temporary signed URLs (15 minutes validity)
- Used for displaying images in the UI
- Bypasses public access restrictions

## Implementation Details

### Frontend (CreateAnnouncementModal.tsx)

1. **Upload Process**:
   - Generate unique filename: `crypto.randomUUID() + extension`
   - Send file with fileName and folder in FormData
   - Store returned public URL in state

2. **Preview Process**:
   - When imageUrl changes, automatically fetch signed URL
   - Display signed URL in preview
   - Show loading spinner while fetching signed URL

3. **State Management**:
   ```typescript
   imageUrl: string | null; // Public S3 URL
   signedImageUrl: string | null; // Temporary signed URL for preview
   finalImageUrl: string | null; // URL to save in database
   ```

### Backend APIs

#### `/api/upload/route.ts`

- Accepts FormData with file, fileName, folder
- Uploads to S3 using PutObjectCommand
- Returns public URL

#### `/api/s3-signed-url/route.ts`

- Accepts S3 key as query parameter
- Generates signed URL using GetObjectCommand
- Returns temporary URL (15 min expiry)

## Environment Variables Required

```env
# S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=ourrapartment

# Alternative naming (for compatibility)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=ourrapartment

# Pusher Configuration
PUSHER_APP_ID="2102749"
PUSHER_KEY="27c7df05859f5ffcb62c"
PUSHER_SECRET="b1b54a6c9353061e4290"
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY="27c7df05859f5ffcb62c"
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"
```

## S3 Bucket Configuration

### Required Settings:

1. **Block Public Access**: Can be ON (recommended)
   - The signed URL approach works with private buckets

2. **Object Ownership**: Bucket owner enforced
   - This is why ACL is NOT used in uploads

3. **CORS Configuration** (if needed for direct browser access):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

## Differences from Previous Implementation

### Before:

- Used presigned URLs for upload (two-step process)
- Tried to use ACL: "public-read" (caused 500 errors)
- Mixed approach with both signed and public URLs

### After:

- Direct server-side upload (one-step process)
- No ACL usage (matches bucket settings)
- Clear separation: public URL for storage, signed URL for display
- Matches reference project pattern exactly

## Testing Checklist

- [x] Upload image in CreateAnnouncementModal
- [x] Preview shows correctly with signed URL
- [ ] Posted announcement displays image in feed
- [ ] Image persists after page refresh
- [ ] Multiple images can be uploaded
- [ ] Error handling works correctly

## Next Steps

1. Update AnnouncementFeed to fetch signed URLs for display
2. Add image carousel support (like reference project)
3. Implement image deletion when announcement is deleted
4. Add image optimization/compression before upload
