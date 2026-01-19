import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  block: z.string().min(1, 'Block is required'),
  floor: z.string().min(1, 'Floor is required'),
  flatNumber: z.string().min(1, 'Flat number is required'),
});

export const completeProfileSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  block: z.string().min(1, 'Block is required'),
  floor: z.string().min(1, 'Floor is required'),
  flatNumber: z.string().min(1, 'Flat number is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
