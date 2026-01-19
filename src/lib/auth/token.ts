import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || 'access-token-secret-replace-me-in-prod'
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret-replace-me-in-prod'
);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export async function signAccessToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET);
}

export async function signRefreshToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_TOKEN_SECRET);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload;
  } catch (error) {
    console.error('JWT Verification Error (Access):', error);
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
