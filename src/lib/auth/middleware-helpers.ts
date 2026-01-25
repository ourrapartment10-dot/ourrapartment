import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { UserRole } from '@/generated/client';

/**
 * Get authenticated user info from middleware-injected headers
 * This should be used in API routes instead of manually checking cookies
 */
export async function getAuthUser() {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const role = headersList.get('x-user-role');

    if (!userId || !role) {
        return null;
    }

    return {
        userId,
        role: role as UserRole,
    };
}

/**
 * Get authenticated user info from request headers (for route handlers)
 */
export function getAuthUserFromRequest(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || !role) {
        return null;
    }

    return {
        userId,
        role: role as UserRole,
    };
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
    const user = await getAuthUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Require specific role - throws error if user doesn't have required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        throw new Error('Forbidden - Insufficient permissions');
    }

    return user;
}
