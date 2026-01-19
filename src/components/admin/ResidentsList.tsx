'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Shield,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronUp,
  MoreVertical,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
  X,
} from 'lucide-react';
import { UserRole, UserStatus } from '@/generated/client';

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  property?: {
    block: string;
    floor: string;
    flatNumber: string;
  } | null;
}

export function ResidentsList() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'RESIDENT'>(
    'ALL'
  );
  const [promotingUser, setPromotingUser] = useState<Resident | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/residents');
      if (res.ok) {
        const data = await res.json();
        setResidents(data);
      } else {
        setError('Failed to fetch residents');
      }
    } catch (err) {
      setError('An error occurred while fetching residents');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!promotingUser) return;

    setIsPromoting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/residents/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: promotingUser.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`${promotingUser.name} is now an Admin!`);
        // Update local state
        setResidents((prev) =>
          prev.map((u) =>
            u.id === promotingUser.id ? { ...u, role: UserRole.ADMIN } : u
          )
        );
        setPromotingUser(null);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to promote user');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsPromoting(false);
    }
  };

  const filteredResidents = residents.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.property?.flatNumber.includes(search) ||
      false;

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const adminsCount = residents.filter((r) => r.role === UserRole.ADMIN).length;
  const residentsCount = residents.filter(
    (r) => r.role === UserRole.RESIDENT
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Total
            </p>
            <p className="text-2xl font-black text-gray-900">
              {residents.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Residents
            </p>
            <p className="text-2xl font-black text-gray-900">
              {residentsCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Admins
            </p>
            <p className="text-2xl font-black text-gray-900">{adminsCount}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search residents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-none bg-gray-50 py-3 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-2 rounded-xl bg-gray-50 p-1.5">
          {(['ALL', 'ADMIN', 'RESIDENT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab === 'ALL'
                ? 'All Users'
                : tab === 'ADMIN'
                  ? 'Admins Only'
                  : 'Residents only'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading community members...</p>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
            <User className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No users found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredResidents.map((user) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={user.id}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Role Badge */}
                <div
                  className={`absolute top-0 right-0 rounded-bl-2xl px-4 py-1 text-[10px] font-black tracking-wider uppercase ${
                    user.role === UserRole.ADMIN
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {user.role}
                </div>

                <div className="mt-2 mb-4 flex items-start gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-inner">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xl font-black text-gray-400">
                        {user.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="mb-1 truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5 text-sm text-gray-600">
                    <Building className="h-4 w-4 text-gray-400" />
                    {user.property ? (
                      <span className="font-semibold">
                        Block {user.property.block} - {user.property.flatNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        No property assigned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pl-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{user.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Actions */}
                {user.role === UserRole.RESIDENT && (
                  <button
                    onClick={() => setPromotingUser(user)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50 py-2.5 text-xs font-bold text-purple-700 transition-colors hover:border-purple-200 hover:bg-purple-100"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Promote to Admin
                  </button>
                )}

                {user.role === UserRole.ADMIN && (
                  <div className="mt-6 flex w-full items-center justify-center gap-2 py-2.5 text-center text-xs font-bold text-gray-300 select-none">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Admin Access Granted
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Promotion Confirmation Modal */}
      <AnimatePresence>
        {promotingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Shield className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
                Promote to Admin?
              </h3>
              <p className="mb-6 text-center text-sm text-gray-500">
                Are you sure you want to promote{' '}
                <span className="font-bold text-gray-800">
                  {promotingUser.name}
                </span>
                ? They will gain full access to the admin dashboard and can
                manage other users.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPromotingUser(null);
                    setError(null);
                  }}
                  className="rounded-xl py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromote}
                  disabled={isPromoting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700"
                >
                  {isPromoting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirm Promotion'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-white shadow-xl"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-bold">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-2 pr-1 opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
