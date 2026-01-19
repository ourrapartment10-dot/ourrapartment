"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { LogOut, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AccountRejected() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100"
            >
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">
                    Application Rejected
                </h1>
                <p className="text-gray-500 mb-6">
                    We're sorry, <span className="font-bold text-gray-700">{user?.name}</span>. Your residential application has been reviewed and could not be approved at this time.
                </p>

                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 mb-8 text-left">
                    <div className="flex items-center gap-2 mb-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Reason provided</span>
                    </div>
                    <p className="text-red-600 text-sm italic font-medium">
                        "{(user as any)?.rejectionReason || "No specific reason provided. Please contact the administrator for details."}"
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={logout}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>

                    <a
                        href="mailto:support@ourrapartment.com"
                        className="block w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Appeal Decision
                    </a>
                </div>

                <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    OurApartment Verification System
                </p>
            </motion.div>
        </div>
    );
}
