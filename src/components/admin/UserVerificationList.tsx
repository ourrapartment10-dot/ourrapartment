'use client';

import { useState, useEffect } from 'react';
import {
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  Loader2,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserRole, UserStatus } from '@/generated/client';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  image: string | null;
  property?: {
    block: string;
    floor: string;
    flatNumber: string;
  } | null;
}

export default function UserVerificationList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rejectionModalUser, setRejectionModalUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleAction = async (
    userId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ) => {
    setProcessingId(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, rejectionReason: reason || '' }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setRejectionModalUser(null);
        setRejectionReason('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process verification');
      }
    } catch (error) {
      console.error('Verification system error', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex min-w-0 items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
              Total Requests
            </p>
            <p className="text-lg font-bold text-gray-900 sm:text-xl">
              {users.length}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
              Pending Review
            </p>
            <p className="text-lg font-bold text-gray-900 sm:text-xl">
              {users.filter((u) => u.status === 'PENDING').length}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-gray-400 uppercase sm:text-xs">
              Filter Match
            </p>
            <p className="text-lg font-bold text-gray-900 sm:text-xl">
              {filteredUsers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Header controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-none bg-gray-50 py-2 pr-4 pl-10 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="mr-1 h-4 w-4 text-gray-400" />
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="font-medium text-gray-500">Loading requests...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <User className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            No {filter.toLowerCase()} requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            When users register, they will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative min-w-0 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:shadow-gray-200/50"
              >
                {/* Slanted Status Ribbon / Badge */}
                <div
                  className={`pointer-events-none absolute top-0 right-0 h-16 w-16`}
                >
                  <div
                    className={`absolute top-[20%] -right-[30%] w-[120%] rotate-45 transform py-1 text-center text-[9px] font-black tracking-tighter text-white uppercase shadow-sm ${
                      user.status === 'PENDING'
                        ? 'bg-purple-600'
                        : user.status === 'APPROVED'
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                    }`}
                  >
                    {user.status}
                  </div>
                </div>

                <div className="mb-6 flex items-start">
                  <div className="flex min-w-0 items-center gap-4 pr-12">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-lg font-bold text-blue-700">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate leading-snug font-bold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>{user.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>
                      Requested {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {user.property && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-2 font-bold text-emerald-600">
                      <Building className="h-4 w-4 shrink-0" />
                      <span>
                        Block {user.property.block} • Floor{' '}
                        {user.property.floor} • Flat {user.property.flatNumber}
                      </span>
                    </div>
                  )}
                </div>

                {filter === 'PENDING' ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAction(user.id, 'APPROVE')}
                      disabled={processingId === user.id}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {processingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve User
                    </button>
                    <button
                      onClick={() =>
                        setRejectionModalUser({ id: user.id, name: user.name })
                      }
                      disabled={processingId === user.id}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all group-hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Reject User"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        filter === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {filter === 'APPROVED' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Verification Status
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        Completed on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 z-[100] w-[90%] max-w-md -translate-x-1/2"
          >
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-rose-600 p-4 text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-bold">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="rounded-lg p-1 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModalUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectionModalUser(null)}
              className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 z-[120] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl"
            >
              <div className="p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 shadow-inner">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Reject Registration
                    </h3>
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                      {rejectionModalUser.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Reason for rejection (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="E.g. Incorrect unit number, name mismatch..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5 font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-300 focus:border-red-600 focus:ring-4 focus:ring-red-600/5 focus:outline-none"
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setRejectionModalUser(null)}
                    className="h-14 flex-1 rounded-2xl bg-slate-50 text-xs font-bold tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleAction(
                        rejectionModalUser.id,
                        'REJECT',
                        rejectionReason
                      )
                    }
                    disabled={processingId === rejectionModalUser.id}
                    className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-2xl bg-red-600 text-xs font-bold tracking-widest text-white uppercase shadow-xl shadow-red-100 transition-all hover:bg-red-700 active:scale-[0.98]"
                  >
                    {processingId === rejectionModalUser.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Confirm Rejection'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
