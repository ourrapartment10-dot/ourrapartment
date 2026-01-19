'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  completeProfileSchema,
  CompleteProfileInput,
} from '@/lib/validations/auth';
import { Input } from '@/components/shared/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Phone,
  Loader2,
  User,
  ArrowRight,
  Building,
  Layers,
  Home,
  ChevronDown,
} from 'lucide-react';
import { useApartmentConfig } from '@/hooks/useApartmentConfig';

import { motion } from 'framer-motion';

export function CompleteProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { updateUser } = useAuth();
  const {
    config,
    loading: configLoading,
    getBlockOptions,
    getFloorOptions,
  } = useApartmentConfig();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
  });

  const onSubmit = async (data: CompleteProfileInput) => {
    setError(null);
    try {
      // Create new API endpoint for updating profile
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Update failed');
      }

      if (json.user) {
        updateUser(json.user);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md space-y-8"
    >
      <div className="space-y-3 text-center">
        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <User className="h-8 w-8" />
        </div>
        <h1 className="font-outfit text-3xl font-bold tracking-tight text-gray-900">
          Complete Your Profile
        </h1>
        <p className="text-sm text-gray-500">
          Just a few more details to get you started.
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-600 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <Input
            id="phone"
            label="Phone Number"
            placeholder="98765 43210"
            icon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="grid grid-cols-3 gap-4">
            {/* Block Input */}
            {config && config.numberOfBlocks > 0 ? (
              <div className="space-y-1">
                <label className="ml-1 text-xs font-semibold text-gray-700">
                  Block
                </label>
                <div className="relative">
                  <select
                    className="focus:ring-primary/20 focus:border-primary h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/50 pr-8 pl-9 text-sm transition-all outline-none focus:ring-2"
                    {...register('block')}
                  >
                    <option value="">Select</option>
                    {getBlockOptions().map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Building className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute top-3 right-3 h-3 w-3 text-gray-400" />
                </div>
                {errors.block && (
                  <p className="ml-1 text-xs text-red-500">
                    {errors.block.message}
                  </p>
                )}
              </div>
            ) : (
              <Input
                id="block"
                label="Block"
                placeholder="A"
                icon={Building}
                error={errors.block?.message}
                {...register('block')}
              />
            )}

            {/* Floor Input */}
            {config && config.numberOfFloors > 0 ? (
              <div className="space-y-1">
                <label className="ml-1 text-xs font-semibold text-gray-700">
                  Floor
                </label>
                <div className="relative">
                  <select
                    className="focus:ring-primary/20 focus:border-primary h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/50 pr-8 pl-9 text-sm transition-all outline-none focus:ring-2"
                    {...register('floor')}
                  >
                    <option value="">Select</option>
                    {getFloorOptions().map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Layers className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute top-3 right-3 h-3 w-3 text-gray-400" />
                </div>
                {errors.floor && (
                  <p className="ml-1 text-xs text-red-500">
                    {errors.floor.message}
                  </p>
                )}
              </div>
            ) : (
              <Input
                id="floor"
                label="Floor"
                placeholder="1"
                icon={Layers}
                error={errors.floor?.message}
                {...register('floor')}
              />
            )}
            <Input
              id="flatNumber"
              label="Flat No"
              placeholder="101"
              icon={Home}
              error={errors.flatNumber?.message}
              {...register('flatNumber', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
          </div>

          <p className="px-4 text-center text-xs text-gray-400">
            We need your phone number for secure community access and emergency
            notifications.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group bg-primary relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-70"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
            <span className="relative flex items-center gap-2">
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Finish Setup
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
