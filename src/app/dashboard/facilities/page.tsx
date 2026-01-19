'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { useState, useEffect } from 'react';
import { UserRole } from '@/generated/client';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Info,
  LayoutGrid,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FacilityCard from '@/components/facilities/FacilityCard';
import CreateFacilityModal from '@/components/facilities/CreateFacilityModal';
import BookingList from '@/components/facilities/BookingList';
import { cn } from '@/lib/utils';

export default function FacilitiesPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'browse' | 'my_bookings' | 'all_bookings'
  >('browse');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

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
      console.error('Failed to fetch facilities', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-12 pb-20">
      {/* dynamic background elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-blue-50/60 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-indigo-100/40 blur-[150px]" />
        <div className="absolute top-[20%] left-[10%] h-[50%] w-[50%] rounded-full bg-slate-50/50 blur-[150px]" />
      </div>

      {/* Premium Header */}
      <div className="relative px-2 pt-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex w-fit items-center gap-3 rounded-2xl bg-blue-50 px-4 py-2 text-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Amenity Hub
              </span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
              >
                Community <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Spaces.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
              >
                Reserve premium amenities, manage your bookings, and enjoy the
                best of community living.
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                Add New Facility
              </button>
            )}

            <div className="group relative w-full sm:w-80">
              <Search className="absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces..."
                className="w-full rounded-[2rem] border border-slate-100 bg-white py-5 pr-6 pl-14 text-sm font-bold text-slate-900 shadow-sm transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Interactive Tabs */}
      <div className="relative px-2">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-2 sm:flex-row sm:items-center">
          <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-white/50 bg-slate-100/50 p-1.5 backdrop-blur-md sm:w-fit">
            <button
              onClick={() => setActiveTab('browse')}
              className={cn(
                'relative flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl px-4 py-2.5 text-[10px] font-black tracking-wider whitespace-nowrap uppercase transition-all duration-300 sm:gap-2 sm:px-6 sm:py-3 sm:text-xs sm:tracking-widest',
                activeTab === 'browse'
                  ? 'text-white shadow-xl'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="xs:inline hidden">Exploration</span>
              <span className="xs:hidden">Browse</span>
              {activeTab === 'browse' && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 -z-10 bg-slate-900"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() =>
                setActiveTab(isAdmin ? 'all_bookings' : 'my_bookings')
              }
              className={cn(
                'relative flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl px-4 py-2.5 text-[10px] font-black tracking-wider whitespace-nowrap uppercase transition-all duration-300 sm:gap-2 sm:px-6 sm:py-3 sm:text-xs sm:tracking-widest',
                activeTab !== 'browse'
                  ? 'text-white shadow-xl'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <ListChecks className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="xs:inline hidden">Reservations</span>
              <span className="xs:hidden">Bookings</span>
              {activeTab !== 'browse' && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 -z-10 bg-slate-900"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                Available now
              </span>
              <span className="text-sm font-black text-slate-900">
                {facilities.length} Spaces
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content Container */}
      <motion.div layout className="px-2">
        <AnimatePresence mode="wait">
          {activeTab === 'browse' ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10 xl:grid-cols-3"
            >
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="relative h-[500px] animate-pulse overflow-hidden rounded-[2.5rem] bg-slate-50"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                ))
              ) : filteredFacilities.length > 0 ? (
                filteredFacilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    isAdmin={isAdmin}
                    onUpdate={fetchFacilities}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-40 text-center">
                  <div className="mb-10 flex h-32 w-32 items-center justify-center rounded-[40px] border border-slate-100 bg-slate-50 shadow-inner">
                    <Search className="h-12 w-12 text-slate-200" />
                  </div>
                  <h3 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                    No matches found
                  </h3>
                  <p className="max-w-xs text-lg font-medium text-slate-500">
                    Adjust your search filters or browse other available
                    amenities.
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
