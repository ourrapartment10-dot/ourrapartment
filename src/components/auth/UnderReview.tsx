"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { LogOut, Clock, ShieldCheck, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function UnderReview() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
            >
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">
                    Profile Under Review
                </h1>
                <p className="text-gray-500 mb-8">
                    Welcome, <span className="font-bold text-gray-700">{user?.name}</span>! Your account has been created successfully and is currently being verified by our administrators.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-semibold text-gray-700">Verification Pending</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                            <Mail className="w-4 h-4 text-gray-400 mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                            <p className="text-xs font-semibold text-gray-700 truncate">{user?.email}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                            <Phone className="w-4 h-4 text-gray-400 mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                            <p className="text-xs font-semibold text-gray-700">{user?.phone || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-8">
                    <p className="text-sm text-blue-700 font-medium">
                        You'll receive full access to the dashboard once an admin approves your residence.
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out & Check Later
                </button>

                <p className="mt-6 text-xs text-gray-400">
                    Need help? Contact <a href="mailto:support@ourrapartment.com" className="text-blue-600 font-bold hover:underline">Support</a>
                </p>
            </motion.div>
        </div>
    );
}
