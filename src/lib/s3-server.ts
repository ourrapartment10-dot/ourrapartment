/**
 * Server-side S3 utilities
 * These functions can only be used in server components and API routes
 */

import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Deletes an object from S3
 * @param key - S3 key (e.g., "announcement-attachments/file.jpg")
 * @returns true if successful, false otherwise
 */
export async function deleteFromS3(key: string): Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME || process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`Successfully deleted S3 object: ${key}`);
        return true;
    } catch (error) {
        console.error(`Error deleting S3 object ${key}:`, error);
        return false;
    }
}

/**
 * Extracts the S3 key from a full S3 URL
 * @param url - Full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/folder/file.jpg)
 * @returns S3 key (e.g., folder/file.jpg) or null if invalid
 */
export function extractS3KeyFromUrl(url: string): string | null {
    try {
        const urlParts = url.split('/');
        if (urlParts.length < 2) return null;

        const folder = urlParts[urlParts.length - 2];
        const fileName = urlParts[urlParts.length - 1];

        // Remove query parameters if present (for signed URLs)
        const cleanFileName = fileName.split('?')[0];

        return `${folder}/${cleanFileName}`;
    } catch (error) {
        console.error('Error extracting S3 key from URL:', error);
        return null;
    }
}

/**
 * Deletes an S3 object using its full URL
 * @param url - Full S3 URL
 * @returns true if successful, false otherwise
 */
export async function deleteFromS3ByUrl(url: string): Promise<boolean> {
    const key = extractS3KeyFromUrl(url);
    if (!key) {
        console.error('Could not extract S3 key from URL:', url);
        return false;
    }

    return await deleteFromS3(key);
}

/**
 * Deletes multiple objects from S3
 * @param keys - Array of S3 keys
 * @returns Array of results (true for success, false for failure)
 */
export async function deleteMultipleFromS3(keys: string[]): Promise<boolean[]> {
    const results = await Promise.all(
        keys.map(key => deleteFromS3(key))
    );
    return results;
}

/**
 * Deletes multiple S3 objects using their URLs
 * @param urls - Array of S3 URLs
 * @returns Array of results (true for success, false for failure)
 */
export async function deleteMultipleFromS3ByUrl(urls: string[]): Promise<boolean[]> {
    const results = await Promise.all(
        urls.map(url => deleteFromS3ByUrl(url))
    );
    return results;
}
