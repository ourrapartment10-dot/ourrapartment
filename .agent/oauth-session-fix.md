# OAuth Session Persistence Fix

## Problem
Users signing in with Google OAuth were getting logged out when they closed the application or restarted their browser. This was happening because the authentication cookies were being set as **session cookies** (deleted when browser closes) instead of **persistent cookies**.

## Root Cause
The authentication cookies (`accessToken` and `refreshToken`) were missing the `maxAge` property. Without `maxAge` or `expires`, browsers treat cookies as session cookies that are automatically deleted when the browser is closed.

## Solution
Added proper cookie configuration to all authentication endpoints:

### Updated Files:
1. **`src/app/api/auth/google/callback/route.ts`** - Google OAuth callback
2. **`src/app/api/auth/login/route.ts`** - Regular email/password login
3. **`src/app/api/auth/signup/route.ts`** - User registration
4. **`src/app/api/auth/refresh/route.ts`** - Token refresh endpoint

### Cookie Configuration:
```typescript
response.cookies.set('accessToken', accessToken, {
  httpOnly: true,           // Prevents JavaScript access (security)
  path: '/',                // Available across entire site
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',          // CSRF protection
  maxAge: 60 * 15,          // 15 minutes (900 seconds)
});

response.cookies.set('refreshToken', refreshToken, {
  httpOnly: true,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days (604800 seconds)
});
```

## How It Works Now

1. **Login (OAuth or Regular)**: User logs in and receives cookies with 7-day expiration
2. **Browser Close**: Cookies persist because they have `maxAge` set
3. **Browser Reopen**: 
   - `AuthContext` checks for valid cookies via `/api/auth/me`
   - If access token expired but refresh token valid, automatically refreshes
   - User stays logged in seamlessly
4. **After 7 Days**: Refresh token expires, user needs to log in again

## Token Lifetimes
- **Access Token**: 15 minutes (short-lived for security)
- **Refresh Token**: 7 days (allows persistent sessions)

## Testing
To verify the fix:
1. Log in with Google OAuth
2. Close the browser completely
3. Reopen the browser and navigate to the application
4. You should remain logged in (no redirect to login page)

## Security Notes
- Tokens are `httpOnly` - cannot be accessed by JavaScript (prevents XSS attacks)
- Tokens are `secure` in production - only sent over HTTPS
- `sameSite: 'lax'` - provides CSRF protection while allowing normal navigation
- Refresh tokens are hashed in the database
- Token rotation on refresh (old refresh token is revoked when used)
