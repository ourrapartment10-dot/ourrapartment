'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { useState, useEffect } from 'react';
import { UserRole, ComplaintType, ComplaintStatus } from '@/generated/client';
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
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import CreateComplaintModal from '@/components/complaints/CreateComplaintModal';
import { getComplaints, getComplaintStats } from '@/app/actions/complaints';
import { cn } from '@/lib/utils';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    avgResolutionHours: 0,
    totalResolved: 0,
  });
  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [complaintToEdit, setComplaintToEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

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
        getComplaintStats(),
      ]);
      setComplaints(complaintsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
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

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="mx-auto max-w-[1600px] space-y-12 pb-20">
      {/* dynamic background elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-50/60 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-blue-100/40 blur-[150px]" />
      </div>

      {/* Premium Header with Stats */}
      <div className="relative space-y-12 px-2 pt-8">
        {/* Top Section: Title & Actions */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-fit items-center gap-3 rounded-2xl bg-amber-50 px-4 py-2 text-amber-700"
            >
              <Shield className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Community Voice
              </span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
              >
                Help & <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Support.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
              >
                Raise concerns, track resolution, and help us improve the
                community experience.
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => {
                setComplaintToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] sm:w-auto"
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
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-8"
        >
          <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Satisfaction Score
              </p>
              <p className="text-2xl font-[900] text-slate-900">
                {stats.avgRating > 0 ? stats.avgRating : '-'}
                <span className="ml-1 text-sm text-slate-400">/ 5.0</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Timer className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Avg. Resolution
              </p>
              <p className="text-2xl font-[900] text-slate-900">
                {stats.avgResolutionHours > 0
                  ? `${stats.avgResolutionHours}h`
                  : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ListChecks className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Issues Resolved
              </p>
              <p className="text-2xl font-[900] text-slate-900">
                {stats.totalResolved}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Search & Tabs */}
        <div className="flex flex-col justify-between gap-6 px-2 sm:flex-row sm:items-center">
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-slate-100/50 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('community')}
              className={cn(
                'relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-xs font-black tracking-widest uppercase transition-all duration-300',
                activeTab === 'community'
                  ? 'text-white shadow-xl'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              Community
              {activeTab === 'community' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 -z-10 bg-slate-900"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={cn(
                'relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-xs font-black tracking-widest uppercase transition-all duration-300',
                activeTab === 'mine'
                  ? 'text-white shadow-xl'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              {isAdmin ? 'Private Reports' : 'My Issues'}
              {activeTab === 'mine' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 -z-10 bg-slate-900"
                />
              )}
            </button>
          </div>

          <div className="group relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints..."
              className="w-full rounded-[2rem] border border-slate-100 bg-white py-4 pr-6 pl-14 text-sm font-bold text-slate-900 shadow-sm transition-all placeholder:text-slate-300 focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="px-2">
          <div className="grid grid-cols-1 items-stretch gap-8 pb-10 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="wait">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="relative h-[350px] animate-pulse overflow-hidden rounded-[2.5rem] bg-slate-50"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
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
                <div className="col-span-full flex flex-col items-center justify-center py-40 text-center">
                  <div className="mb-10 flex h-32 w-32 items-center justify-center rounded-[40px] border border-slate-100 bg-slate-50 shadow-inner">
                    <MessageSquare className="h-12 w-12 text-slate-200" />
                  </div>
                  <h3 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                    No issues found
                  </h3>
                  <p className="max-w-xs text-lg font-medium text-slate-500">
                    {searchQuery
                      ? 'Try adjusting your search filters.'
                      : 'Everything seems to be running smoothly!'}
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
