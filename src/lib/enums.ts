/**
 * Application Enums
 * Centralized enums for type-safe usage across the application
 */

// Re-export Prisma enums
export {
  UserRole,
  UserStatus,
  AuthProvider,
  BlockNamingConvention,
} from '@/generated/client';

// Notification types (not in Prisma schema yet, but used in app)
export enum NotificationType {
  VERIFICATION_REQUEST = 'VERIFICATION_REQUEST',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
}

// Helper functions for role checking
export const isAdmin = (role: string) => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

export const isSuperAdmin = (role: string) => {
  return role === 'SUPER_ADMIN';
};

export const isResident = (role: string) => {
  return role === 'RESIDENT';
};
