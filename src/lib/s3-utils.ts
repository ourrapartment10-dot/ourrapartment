/**
 * S3 Utilities
 * Reusable functions for S3 operations across the application
 */

/**
 * Extracts the S3 key from a full S3 URL
 * @param url - Full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/folder/file.jpg)
 * @returns S3 key (e.g., folder/file.jpg)
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlParts = url.split('/');
    if (urlParts.length < 2) return null;

    const folder = urlParts[urlParts.length - 2];
    const fileName = urlParts[urlParts.length - 1];

    return `${folder}/${fileName}`;
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
}

/**
 * Checks if a file is an image based on its extension
 * @param fileName - Name of the file
 * @returns true if the file is an image
 */
export function isImageFile(fileName: string): boolean {
  return /\.(jpeg|jpg|png|gif|webp|jfif)$/i.test(fileName);
}

/**
 * Fetches a signed URL for an S3 object
 * @param key - S3 key (e.g., folder/file.jpg)
 * @returns Signed URL or null if failed
 */
export async function fetchSignedUrl(key: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/s3-signed-url?key=${encodeURIComponent(key)}`
    );

    if (!response.ok) {
      console.error(
        `Failed to get signed URL for ${key}:`,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error(`Error fetching signed URL for ${key}:`, error);
    return null;
  }
}

/**
 * Fetches signed URLs for multiple S3 URLs
 * @param urls - Array of S3 URLs
 * @returns Map of original URL to signed URL
 */
export async function fetchSignedUrls(
  urls: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  await Promise.all(
    urls.map(async (url) => {
      const key = extractS3Key(url);
      if (!key) {
        results.set(url, null);
        return;
      }

      const signedUrl = await fetchSignedUrl(key);
      results.set(url, signedUrl);
    })
  );

  return results;
}

/**
 * Uploads a file to S3
 * @param file - File to upload
 * @param folder - S3 folder (e.g., "announcement-attachments")
 * @returns Public S3 URL or null if failed
 */
export async function uploadToS3(
  file: File,
  folder: string
): Promise<string | null> {
  try {
    // Generate unique filename
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${extension}`;

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('folder', folder);

    // Upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return null;
  }
}

/**
 * Validates if a file is suitable for upload
 * @param file - File to validate
 * @param options - Validation options
 * @returns Error message or null if valid
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): string | null {
  const {
    maxSizeMB = 5,
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }

  return null;
}

/**
 * S3 URL cache entry
 */
export interface S3UrlCacheEntry {
  url: string | null;
  expiresAt: number;
}

/**
 * Creates a cache manager for S3 signed URLs
 * @param expirationMinutes - Cache expiration time in minutes (default: 14)
 */
export function createS3UrlCache(expirationMinutes: number = 14) {
  const cache = new Map<string, S3UrlCacheEntry>();
  const expirationMs = expirationMinutes * 60 * 1000;

  return {
    get(key: string): string | null {
      const entry = cache.get(key);
      if (!entry) return null;

      const now = Date.now();
      if (entry.expiresAt <= now) {
        cache.delete(key);
        return null;
      }

      return entry.url;
    },

    set(key: string, url: string | null): void {
      cache.set(key, {
        url,
        expiresAt: Date.now() + expirationMs,
      });
    },

    clear(): void {
      cache.clear();
    },

    delete(key: string): void {
      cache.delete(key);
    },
  };
}
