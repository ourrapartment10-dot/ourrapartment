'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  // Poll for notifications every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 p-4">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold tracking-wider text-blue-600 uppercase hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                    <Bell className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div>
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 border-b border-gray-50 bg-blue-50/30 p-4 transition-colors hover:bg-gray-50/50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-bold text-blue-600 hover:underline"
                              >
                                View Details
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
