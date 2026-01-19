import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';
import { handleApiError, ApiError } from '@/lib/api-error';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) throw new ApiError(401, 'Unauthorized');

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) throw new ApiError(401, 'Unauthorized');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const folder = formData.get('folder') as string;

    if (!file || !fileName || !folder) {
      throw new ApiError(400, 'Missing file, fileName, or folder');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadParams = {
      Bucket:
        process.env.AWS_BUCKET_NAME ||
        process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const url = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1'}.amazonaws.com/${uploadParams.Key}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error uploading file to S3 via API:', error);
    return handleApiError(error);
  }
}
