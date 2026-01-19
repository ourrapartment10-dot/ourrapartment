"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    CheckCircle,
    Shield,
    User as UserIcon,
    Bell
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { PushNotificationManager } from "./PushNotificationManager";

export function ProfileSettings() {
    const { user, updateUser } = useAuth();

    // Profile form state
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync state with user when it loads
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setNotificationsEnabled(user.notificationsEnabled ?? true);
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            setMessage({ type: 'error', text: "Name is required" });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, notificationsEnabled }),
            });

            const data = await res.json();

            if (res.ok) {
                updateUser(data.user);
                setMessage({ type: 'success', text: "Profile updated successfully!" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || "Failed to update profile" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An unexpected error occurred" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500">Update your account details and public profile.</p>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-6 pb-4">
                <div className="h-20 w-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shadow-inner flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                        Change Avatar
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider italic">JPG or PNG. Max 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input
                        type="email"
                        disabled
                        defaultValue={user?.email}
                        className="w-full px-5 py-4 bg-gray-100/50 border border-gray-100 rounded-2xl text-sm text-gray-400 cursor-not-allowed outline-none font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Not provided"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-700"
                    />
                </div>
                {/* Notification Toggle */}
                <div className="col-span-1 md:col-span-2 pt-2">
                    <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl group cursor-pointer hover:border-blue-100 transition-all" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl transition-all ${notificationsEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">In-App Notifications</h4>
                                <p className="text-xs text-gray-500 mt-0.5 max-w-sm">Receive alerts about verification requests and important community announcements.</p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full transition-all duration-300 relative ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-all duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="col-span-1 md:col-span-2">
                    <PushNotificationManager />
                </div>
            </div>
            <div className="pt-4 border-t border-gray-50">
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 min-w-[140px]"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
