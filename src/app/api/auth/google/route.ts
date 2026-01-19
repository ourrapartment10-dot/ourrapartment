import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  googleAuthUrl.searchParams.set(
    'client_id',
    process.env.GOOGLE_CLIENT_ID || ''
  );
  const origin = req.nextUrl.origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'email profile openid');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token if needed, though we don't need Google's refresh token for our own auth, just user info.

  return NextResponse.redirect(googleAuthUrl.toString());
}
