"use client";

import { useState } from "react";
import {
    Settings,
    Bell,
    Shield,
    CreditCard,
    HelpCircle,
    User,
    CheckCircle2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import UserVerificationList from "@/components/admin/UserVerificationList";
import { ProfileSettings } from "@/components/shared/ProfileSettings";
import { useAuth } from "@/components/auth/AuthContext";
import { UserRole } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    const tabs = [
        { id: "profile", name: "Profile Settings", icon: User },
        ...(isAdmin ? [{ id: "verifications", name: "User Verifications", icon: CheckCircle2 }] : []),
        { id: "notifications", name: "Notifications", icon: Bell },
        { id: "security", name: "Security", icon: Shield },
        { id: "billing", name: "Billing & Plans", icon: CreditCard },
    ];

    const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];
    const ActiveIcon = activeTabObj.icon;

    return (
        <div className="space-y-6 pb-20 sm:pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                        <Settings className="h-6 w-6 text-blue-600" />
                        Account Settings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your account preferences and administrative tasks.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">

                {/* Desktop Navigation Bar (Hidden on Mobile) */}
                <div className="hidden lg:flex items-center gap-1 p-2 bg-gray-50/50 border-b border-gray-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap min-w-fit ${isActive
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                {tab.name}
                                {tab.id === 'verifications' && isAdmin && (
                                    <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile Expandable Navigation (Visible only on Mobile) */}
                <div className="lg:hidden bg-gray-50/50 border-b border-gray-100">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-full flex items-center justify-between p-5 text-sm font-bold text-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <ActiveIcon className="h-5 w-5 text-blue-600" />
                            <span>{activeTabObj.name}</span>
                        </div>
                        {isMobileMenuOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>

                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white px-2 pb-2"
                            >
                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${isActive
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <Icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                                                {tab.name}
                                                {tab.id === 'verifications' && isAdmin && (
                                                    <span className="ml-auto bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full">ADMIN</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0">
                    <div className="w-full">
                        {activeTab === "verifications" && isAdmin && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Review and verify new community members.</p>
                                </div>
                                <UserVerificationList />
                            </div>
                        )}

                        {activeTab === "profile" && <ProfileSettings />}

                        {["notifications", "security", "billing"].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-gray-100">
                                    <HelpCircle className="h-10 w-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Module under development</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed px-4">
                                    We're working hard to bring you more control over your experience. Stay tuned for advanced preferences!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
