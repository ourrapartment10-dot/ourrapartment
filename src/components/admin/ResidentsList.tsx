"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Shield, User, MapPin, Phone, Mail, ChevronUp, MoreVertical, Loader2, CheckCircle2, AlertCircle, Building, X } from "lucide-react";
import { UserRole, UserStatus } from "@/generated/client";

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
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "RESIDENT">("ALL");
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
            const res = await fetch("/api/admin/residents");
            if (res.ok) {
                const data = await res.json();
                setResidents(data);
            } else {
                setError("Failed to fetch residents");
            }
        } catch (err) {
            setError("An error occurred while fetching residents");
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!promotingUser) return;

        setIsPromoting(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/residents/promote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: promotingUser.id }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`${promotingUser.name} is now an Admin!`);
                // Update local state
                setResidents(prev => prev.map(u =>
                    u.id === promotingUser.id ? { ...u, role: UserRole.ADMIN } : u
                ));
                setPromotingUser(null);

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || "Failed to promote user");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsPromoting(false);
        }
    };

    const filteredResidents = residents.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.property?.flatNumber.includes(search) || false;

        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const adminsCount = residents.filter(r => r.role === UserRole.ADMIN).length;
    const residentsCount = residents.filter(r => r.role === UserRole.RESIDENT).length;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <UsersIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-black text-gray-900">{residents.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Residents</p>
                        <p className="text-2xl font-black text-gray-900">{residentsCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admins</p>
                        <p className="text-2xl font-black text-gray-900">{adminsCount}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search residents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                    />
                </div>

                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl">
                    {(["ALL", "ADMIN", "RESIDENT"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setRoleFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${roleFilter === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {tab === "ALL" ? "All Users" : tab === "ADMIN" ? "Admins Only" : "Residents only"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                    <p className="text-sm font-medium">Loading community members...</p>
                </div>
            ) : filteredResidents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <User className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No users found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredResidents.map((user) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={user.id}
                                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                            >
                                {/* Role Badge */}
                                <div className={`absolute top-0 right-0 py-1 px-4 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider
                                    ${user.role === UserRole.ADMIN
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                                >
                                    {user.role}
                                </div>

                                <div className="flex items-start gap-4 mb-4 mt-2">
                                    <div className="h-14 w-14 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 shadow-inner">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xl font-black text-gray-400 bg-gray-50">
                                                {user.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-gray-900 truncate">{user.name}</h3>
                                        <p className="text-xs text-gray-500 truncate mb-1">{user.email}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        {user.property ? (
                                            <span className="font-semibold">Block {user.property.block} - {user.property.flatNumber}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">No property assigned</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 pl-2">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{user.phone || "No phone"}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {user.role === UserRole.RESIDENT && (
                                    <button
                                        onClick={() => setPromotingUser(user)}
                                        className="mt-6 w-full py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 hover:border-purple-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                        Promote to Admin
                                    </button>
                                )}

                                {user.role === UserRole.ADMIN && (
                                    <div className="mt-6 w-full py-2.5 text-center text-xs font-bold text-gray-300 flex items-center justify-center gap-2 select-none">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full"
                        >
                            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 mx-auto">
                                <Shield className="h-6 w-6" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Promote to Admin?</h3>
                            <p className="text-sm text-center text-gray-500 mb-6">
                                Are you sure you want to promote <span className="font-bold text-gray-800">{promotingUser.name}</span>?
                                They will gain full access to the admin dashboard and can manage other users.
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
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
                                    className="py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePromote}
                                    disabled={isPromoting}
                                    className="py-3 text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {isPromoting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Confirm Promotion"
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
                        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-bold text-sm">{success}</span>
                        <button onClick={() => setSuccess(null)} className="ml-2 pr-1 opacity-80 hover:opacity-100">
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
    )
}
