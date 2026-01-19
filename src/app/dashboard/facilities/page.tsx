"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import { UserRole } from "@/generated/client";
import { Plus, Search, Calendar, MapPin, Users, DollarSign, Clock, Info, LayoutGrid, ListChecks, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FacilityCard from "@/components/facilities/FacilityCard";
import CreateFacilityModal from "@/components/facilities/CreateFacilityModal";
import BookingList from "@/components/facilities/BookingList";
import { cn } from "@/lib/utils";

export default function FacilitiesPage() {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'browse' | 'my_bookings' | 'all_bookings'>('browse');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/facilities');
            const data = await res.json();
            if (res.ok) setFacilities(data);
        } catch (error) {
            console.error("Failed to fetch facilities", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* dynamic background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-50/60 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-100/40 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-slate-50/50 rounded-full blur-[150px]" />
            </div>

            {/* Premium Header */}
            <div className="relative pt-8 px-2">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl w-fit"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Amenity Hub</span>
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-[900] text-slate-900 tracking-tighter leading-[0.9]"
                            >
                                Community <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Spaces.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-500 text-lg lg:text-xl font-medium max-w-lg leading-relaxed"
                            >
                                Reserve premium amenities, manage your bookings, and enjoy the best of community living.
                            </motion.p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        {isAdmin && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <Plus className="h-5 w-5" />
                                Add New Facility
                            </button>
                        )}

                        <div className="w-full sm:w-80 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search spaces..."
                                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Custom Interactive Tabs */}
            <div className="relative px-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl w-full sm:w-fit border border-white/50 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={cn(
                                "relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden whitespace-nowrap flex-shrink-0",
                                activeTab === 'browse' ? "text-white shadow-xl" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">Exploration</span>
                            <span className="xs:hidden">Browse</span>
                            {activeTab === 'browse' && (
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-0 bg-slate-900 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab(isAdmin ? 'all_bookings' : 'my_bookings')}
                            className={cn(
                                "relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden whitespace-nowrap flex-shrink-0",
                                activeTab !== 'browse' ? "text-white shadow-xl" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            <ListChecks className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">Reservations</span>
                            <span className="xs:hidden">Bookings</span>
                            {activeTab !== 'browse' && (
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-0 bg-slate-900 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Available now</span>
                            <span className="text-sm font-black text-slate-900">{facilities.length} Spaces</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Content Container */}
            <motion.div
                layout
                className="px-2"
            >
                <AnimatePresence mode="wait">
                    {activeTab === 'browse' ? (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10"
                        >
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-slate-50 rounded-[2.5rem] h-[500px] animate-pulse relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                ))
                            ) : filteredFacilities.length > 0 ? (
                                filteredFacilities.map(facility => (
                                    <FacilityCard
                                        key={facility.id}
                                        facility={facility}
                                        isAdmin={isAdmin}
                                        onUpdate={fetchFacilities}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                                    <div className="h-32 w-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-10 border border-slate-100 shadow-inner">
                                        <Search className="h-12 w-12 text-slate-200" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">No matches found</h3>
                                    <p className="text-slate-500 font-medium max-w-xs text-lg">
                                        Adjust your search filters or browse other available amenities.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <BookingList isAdmin={isAdmin} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <CreateFacilityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchFacilities}
            />
        </div>
    );
}
