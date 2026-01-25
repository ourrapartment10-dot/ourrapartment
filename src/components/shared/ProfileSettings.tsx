'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle,
  Shield,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PushNotificationManager } from './PushNotificationManager';

export function ProfileSettings() {
  const { user, updateUser } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync state with user when it loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.notificationsEnabled !== undefined) {
        setNotificationsEnabled(user.notificationsEnabled);
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          notificationsEnabled
        }),
      });

      const data = await res.json();

      if (res.ok) {
        updateUser(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 max-w-3xl space-y-8 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">
            Profile Information
          </h2>
          <p className="text-sm text-gray-500">
            Update your account details and public profile.
          </p>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${message.type === 'success'
                ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border border-red-100 bg-red-50 text-red-700'
                }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6 pb-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-2xl font-bold text-blue-700 shadow-inner">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
            Change Avatar
          </button>
          <p className="mt-2 text-[10px] font-medium tracking-wider text-gray-400 uppercase italic">
            JPG or PNG. Max 2MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="pl-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="space-y-2">
          <label className="pl-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Email Address
          </label>
          <input
            type="email"
            disabled
            defaultValue={user?.email}
            className="w-full cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-100/50 px-5 py-4 text-sm font-medium text-gray-400 outline-none"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="pl-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Not provided"
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-700 transition-all outline-none placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Notification Settings (Residents Only) */}
        {user?.role === 'RESIDENT' && (
          <div className="space-y-6 md:col-span-2 pt-4 border-t border-gray-100">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-gray-900">In-App Notifications</label>
                <p className="text-xs font-medium text-gray-500">Receive alerts within the application</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                type="button"
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Push Notifications Manager */}
            <PushNotificationManager />
          </div>
        )}
      </div>
      <div className="border-t border-gray-50 pt-4">
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="flex w-full min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:active:scale-100 sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
