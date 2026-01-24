'use client';

import { useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { PushNotificationManager } from './PushNotificationManager';

export function NotificationSettings() {
    const { user, updateUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleInAppNotifications = async (newValue: boolean) => {
        setIsUpdating(true);
        try {
            // Optimistic update
            if (user) {
                updateUser({ ...user, notificationsEnabled: newValue });
            }

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user?.name,
                    phone: user?.phone,
                    notificationsEnabled: newValue,
                }),
            });

            if (!res.ok) {
                // Revert if failed (optional, simplified here)
                console.error('Failed to update notification settings');
            }
        } catch (error) {
            console.error('Error updating notification settings', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 max-w-3xl space-y-8 duration-500">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">
                        Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-500">
                        Choose how you want to be notified about important updates.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* In-App Notification Toggle */}
                <div
                    onClick={() => !isUpdating && toggleInAppNotifications(!user?.notificationsEnabled)}
                    className={`group flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-blue-100 hover:shadow-sm ${isUpdating ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`rounded-xl p-3 transition-colors ${user?.notificationsEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                            <Bell className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-gray-900">
                                In-App Notifications
                            </h4>
                            <p className="mt-1 max-w-md text-sm text-gray-500">
                                Receive visual alerts within the dashboard for actions like payment confirmations, new announcements, and status updates.
                            </p>
                        </div>
                    </div>

                    <div className="pl-4">
                        {isUpdating ? (
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        ) : (
                            <div className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${user?.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${user?.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="rounded-2xl border border-gray-100 bg-white p-1">
                    <PushNotificationManager />
                </div>
            </div>
        </div>
    );
}
