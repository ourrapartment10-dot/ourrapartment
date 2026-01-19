"use client";

import { useState, useEffect } from "react";
import { Check, X, Mail, Phone, Calendar, Search, Filter, Loader2, User, Clock, AlertCircle, CheckCircle2, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { UserRole, UserStatus } from "@/generated/client";

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
    const [filter, setFilter] = useState("PENDING");
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [rejectionModalUser, setRejectionModalUser] = useState<{ id: string, name: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/verifications?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch verifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const handleAction = async (userId: string, action: "APPROVE" | "REJECT", reason?: string) => {
        setProcessingId(userId);
        setError(null);
        try {
            const res = await fetch("/api/admin/verifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action, rejectionReason: reason || "" }),
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
                setRejectionModalUser(null);
                setRejectionReason("");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to process verification");
            }
        } catch (error) {
            console.error("Verification system error", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase truncate">Total Requests</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase truncate">Pending Review</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">{users.filter(u => u.status === 'PENDING').length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase truncate">Filter Match</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">{filteredUsers.length}</p>
                    </div>
                </div>
            </div>

            {/* Header controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 mr-1" />
                    {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === s
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
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
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading requests...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No {filter.toLowerCase()} requests</h3>
                    <p className="text-gray-500 text-sm mt-1">When users register, they will appear here for verification.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-gray-200/50 transition-all group min-w-0 relative overflow-hidden"
                            >
                                {/* Slanted Status Ribbon / Badge */}
                                <div className={`absolute top-0 right-0 h-16 w-16 pointer-events-none`}>
                                    <div className={`absolute transform rotate-45 text-center text-[9px] font-black py-1 w-[120%] -right-[30%] top-[20%] shadow-sm uppercase tracking-tighter text-white
                                        ${user.status === 'PENDING' ? 'bg-purple-600' :
                                            user.status === 'APPROVED' ? 'bg-emerald-500' :
                                                'bg-red-500'}`}>
                                        {user.status}
                                    </div>
                                </div>

                                <div className="flex items-start mb-6">
                                    <div className="flex items-center gap-4 pr-12 min-w-0">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-lg overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                user.name[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate leading-snug">{user.name}</h3>
                                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{user.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 text-sm">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span>{user.phone || "No phone provided"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span>Requested {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {user.property && (
                                        <div className="flex items-center gap-3 text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                                            <Building className="h-4 w-4 shrink-0" />
                                            <span>
                                                Block {user.property.block} • Floor {user.property.floor} • Flat {user.property.flatNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {filter === "PENDING" ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleAction(user.id, "APPROVE")}
                                            disabled={processingId === user.id}
                                            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {processingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            Approve User
                                        </button>
                                        <button
                                            onClick={() => setRejectionModalUser({ id: user.id, name: user.name })}
                                            disabled={processingId === user.id}
                                            className="w-11 h-11 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-100 rounded-xl transition-all flex items-center justify-center group-hover:border-red-100 disabled:opacity-50"
                                            title="Reject User"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${filter === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {filter === 'APPROVED' ? <Check className="h-4 w-4 " /> : <X className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Verification Status</p>
                                            <p className="text-xs font-bold text-gray-700">Completed on {new Date().toLocaleDateString()}</p>
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
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
                    >
                        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                            <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
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
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[2.5rem] shadow-2xl z-[120] overflow-hidden border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 shadow-inner">
                                        <X className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Reject Registration</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rejectionModalUser.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reason for rejection (Optional)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="E.g. Incorrect unit number, name mismatch..."
                                        rows={4}
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all placeholder:text-slate-300 resize-none shadow-inner"
                                    />
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setRejectionModalUser(null)}
                                        className="flex-1 h-14 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleAction(rejectionModalUser.id, "REJECT", rejectionReason)}
                                        disabled={processingId === rejectionModalUser.id}
                                        className="flex-[2] h-14 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all active:scale-[0.98] shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        {processingId === rejectionModalUser.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Confirm Rejection"
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
