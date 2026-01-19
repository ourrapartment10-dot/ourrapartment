import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out' });

    // Clear cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
