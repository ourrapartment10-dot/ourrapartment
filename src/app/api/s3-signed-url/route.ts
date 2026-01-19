import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { s3Client } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      throw new ApiError(400, 'Missing S3 object key');
    }

    const getObjectParams = {
      Bucket:
        process.env.AWS_BUCKET_NAME ||
        process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Key: key,
    };

    // Generate a signed URL that is valid for 15 minutes
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 900 }
    );

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    return handleApiError(error);
  }
}
