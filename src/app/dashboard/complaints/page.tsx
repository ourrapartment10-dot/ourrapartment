"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import { UserRole, ComplaintType, ComplaintStatus } from "@/generated/client";
import {
    Plus,
    Search,
    MessageSquare,
    Shield,
    Sparkles,
    LayoutGrid,
    ListChecks,
    Globe,
    Lock,
    BarChart3,
    Timer,
    Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ComplaintCard from "@/components/complaints/ComplaintCard";
import CreateComplaintModal from "@/components/complaints/CreateComplaintModal";
import { getComplaints, getComplaintStats } from "@/app/actions/complaints";
import { cn } from "@/lib/utils";

export default function ComplaintsPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [stats, setStats] = useState({ avgRating: 0, avgResolutionHours: 0, totalResolved: 0 });
    const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [complaintToEdit, setComplaintToEdit] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [complaintsData, statsData] = await Promise.all([
                getComplaints(),
                getComplaintStats()
            ]);
            setComplaints(complaintsData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (complaint: any) => {
        setComplaintToEdit(complaint);
        setIsCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setComplaintToEdit(null);
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'community') {
            return c.type === ComplaintType.PUBLIC;
        } else {
            if (isAdmin) {
                return c.type === ComplaintType.PRIVATE;
            } else {
                return c.type === ComplaintType.PRIVATE && c.userId === user?.id;
            }
        }
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* dynamic background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-50/60 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-100/40 rounded-full blur-[150px]" />
            </div>

            {/* Premium Header with Stats */}
            <div className="relative pt-8 px-2 space-y-12">

                {/* Top Section: Title & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl w-fit"
                        >
                            <Shield className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community Voice</span>
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-[900] text-slate-900 tracking-tighter leading-[0.9]"
                            >
                                Help & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Support.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-500 text-lg lg:text-xl font-medium max-w-lg leading-relaxed"
                            >
                                Raise concerns, track resolution, and help us improve the community experience.
                            </motion.p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <button
                            onClick={() => {
                                setComplaintToEdit(null);
                                setIsCreateModalOpen(true);
                            }}
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <Plus className="h-5 w-5" />
                            Raise Complaint
                        </button>
                    </motion.div>
                </div>

                {/* Performance Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8"
                >
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Star className="h-6 w-6 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfaction Score</p>
                            <p className="text-2xl font-[900] text-slate-900">{stats.avgRating > 0 ? stats.avgRating : "-"}<span className="text-sm text-slate-400 ml-1">/ 5.0</span></p>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Timer className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Resolution</p>
                            <p className="text-2xl font-[900] text-slate-900">{stats.avgResolutionHours > 0 ? `${stats.avgResolutionHours}h` : "-"}</p>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ListChecks className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issues Resolved</p>
                            <p className="text-2xl font-[900] text-slate-900">{stats.totalResolved}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-white/50">
                        <button
                            onClick={() => setActiveTab('community')}
                            className={cn(
                                "relative px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 overflow-hidden",
                                activeTab === 'community' ? "text-white shadow-xl" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Community
                            {activeTab === 'community' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-slate-900 -z-10"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={cn(
                                "relative px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 overflow-hidden",
                                activeTab === 'mine' ? "text-white shadow-xl" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            <Lock className="h-3.5 w-3.5" />
                            {isAdmin ? "Private Reports" : "My Issues"}
                            {activeTab === 'mine' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-slate-900 -z-10"
                                />
                            )}
                        </button>
                    </div>

                    <div className="w-full sm:w-80 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search complaints..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 shadow-sm transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 items-stretch">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-slate-50 rounded-[2.5rem] h-[350px] animate-pulse relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                ))
                            ) : filteredComplaints.length > 0 ? (
                                filteredComplaints.map((complaint, index) => (
                                    <motion.div
                                        key={complaint.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                delay: index * 0.05,
                                                duration: 0.6,
                                                ease: [0.22, 1, 0.36, 1]
                                            }
                                        }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="h-full"
                                    >
                                        <ComplaintCard
                                            complaint={complaint}
                                            currentUser={user}
                                            onUpdate={fetchData}
                                            onEdit={() => handleEdit(complaint)}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                                    <div className="h-32 w-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-10 border border-slate-100 shadow-inner">
                                        <MessageSquare className="h-12 w-12 text-slate-200" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">No issues found</h3>
                                    <p className="text-slate-500 font-medium max-w-xs text-lg">
                                        {searchQuery ? "Try adjusting your search filters." : "Everything seems to be running smoothly!"}
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <CreateComplaintModal
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                onSuccess={fetchData}
                complaintToEdit={complaintToEdit}
            />
        </div>
    );
}
