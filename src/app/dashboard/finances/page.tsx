'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Plus,
  BarChart3,
  List,
  Wallet,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { FinanceStats } from '@/components/finances/FinanceStats';
import { FinanceChart } from '@/components/finances/FinanceChart';
import { FinanceInsights } from '@/components/finances/FinanceInsights';
import { FinanceList } from '@/components/finances/FinanceList';
import { FinanceForm } from '@/components/finances/FinanceForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FinanceDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data State
  const [finances, setFinances] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalRecords: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const limit = 10;

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeRange, setTimeRange] = useState('1m');

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '1m':
        start.setMonth(start.getMonth() - 1);
        break;
      case '3m':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    setFilters((prev) => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const res = await fetch(`/api/finances?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch finances');

      const data = await res.json();
      setFinances(data.finances);
      setStats({
        totalIncome: data.totalIncome,
        totalExpenses: data.totalExpenses,
        netBalance: data.netBalance,
        totalRecords: data.totalRecords,
      });

      const combined = [
        ...data.finances.map((f: any) => ({ ...f, type: 'expense' })),
        ...(data.incomeRecords || []),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Group by date/month for chart
      const chartGroups: {
        [key: string]: { income: number; expense: number; timestamp: number };
      } = {};

      // 1. Initialize all months/days in the range to ensure zero values are shown
      const current = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      while (current <= end) {
        const dateKey =
          timeRange === '1m'
            ? current.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })
            : current.toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              });

        if (!chartGroups[dateKey]) {
          chartGroups[dateKey] = {
            income: 0,
            expense: 0,
            timestamp: current.getTime(),
          };
        }

        if (timeRange === '1m') {
          current.setDate(current.getDate() + 1);
        } else {
          current.setMonth(current.getMonth() + 1);
        }
      }

      // 2. Populate with actual data
      combined.forEach((item: any) => {
        const dateObj = new Date(item.date);
        let dateKey = '';

        if (timeRange === '1m') {
          dateKey = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          });
        } else {
          dateKey = dateObj.toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          });
        }

        if (chartGroups[dateKey]) {
          if (item.type === 'income')
            chartGroups[dateKey].income += item.amount;
          else chartGroups[dateKey].expense += item.amount;
        }
      });

      const mappedChartData = Object.entries(chartGroups)
        .map(([name, vals]) => ({
          name,
          ...vals,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setChartData(mappedChartData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create record');
      toast.success('Expense recorded successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to create record');
      throw error;
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingFinance) return;
    try {
      const res = await fetch(`/api/finances/${editingFinance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update record');
      toast.success('Record updated');
      fetchData();
    } catch (error) {
      toast.error('Update failed');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/finances/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Record deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      desc: 'Balance & statistics',
    },
    { id: 'list', label: 'Transactions', icon: List, desc: 'Detailed log' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-12 pb-32">
      {/* Background Polish */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-emerald-50/40 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] h-[40%] w-[40%] rounded-full bg-indigo-50/30 blur-[120px]" />
      </div>

      {/* Premium Header */}
      <div className="relative px-2 pt-12">
        <div className="flex flex-col gap-16 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-24">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex w-fit cursor-default items-center gap-3 rounded-full border border-slate-100 bg-white px-5 py-2.5 shadow-sm"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                <Sparkles className="h-3 w-3 fill-white text-white" />
              </div>
              <span className="text-[11px] font-[900] tracking-[0.2em] text-slate-800 uppercase">
                Community Financial Portal
              </span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl leading-[0.85] font-[1000] tracking-[-0.04em] text-slate-900 md:text-7xl lg:text-[5rem] xl:text-[6rem]"
              >
                Community <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                  Financials.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl text-lg leading-relaxed font-bold text-slate-500 md:text-xl"
              >
                A transparent, real-time ecosystem for managing community income
                and expenditures with intelligent forecasting.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-black text-slate-700">
                  Audit Ready
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-black text-slate-700">
                  Real-time Feed
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
            className="relative hidden lg:block"
          >
            {/* Dynamic Glow Surround */}
            <div className="absolute -inset-4 -z-10 animate-pulse bg-gradient-to-tr from-emerald-500/30 via-indigo-500/20 to-emerald-500/30 opacity-50 blur-[60px]" />

            <div className="group relative overflow-hidden rounded-[3.5rem] border border-white/5 bg-slate-950 p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]">
              {/* Inner Decorative Elements */}
              <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />

              <div className="absolute top-0 right-0 p-10 opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-20">
                <Wallet className="h-48 w-48 text-white" />
              </div>

              <div className="relative space-y-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <h2 className="text-[11px] font-[1000] tracking-[0.4em] text-white/40 uppercase">
                      Live Revenue Stream
                    </h2>
                  </div>
                  <p className="text-sm font-bold text-white/80">
                    Total Collection Found
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="flex items-start gap-1 text-7xl leading-none font-[1000] tracking-[-0.05em] text-white">
                    <span className="mt-2 text-3xl font-black text-emerald-500">
                      ₹
                    </span>
                    {new Intl.NumberFormat('en-IN').format(stats.totalIncome)}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                      <p className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-emerald-400 uppercase">
                        <TrendingUp className="h-3 w-3" />
                        Verified Funds
                      </p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingFinance(null);
                      setShowForm(true);
                    }}
                    className="group/btn relative w-full overflow-hidden rounded-[2.5rem] bg-emerald-500 py-6 text-xs font-[1000] tracking-[0.2em] text-white uppercase shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-400 active:scale-[0.98]"
                  >
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative flex items-center justify-center gap-3">
                      <Plus className="h-5 w-5 stroke-[4]" />
                      Record New Expense
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Floating Status Badge */}
            <div className="absolute -top-4 -right-4 flex items-center gap-3 rounded-2xl border border-slate-50 bg-white px-6 py-3 shadow-2xl">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">
                Active Audit
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dynamic Stats Section */}
      <div className="px-2">
        <FinanceStats
          totalIncome={stats.totalIncome}
          totalExpenses={stats.totalExpenses}
          netBalance={stats.netBalance}
        />
      </div>

      {/* Section Controls */}
      <div className="flex flex-col items-end justify-between gap-8 px-2 md:flex-row">
        <div className="scrollbar-hide flex w-full overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-slate-50/80 p-2 shadow-sm backdrop-blur-md md:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={cn(
                  'group flex flex-shrink-0 items-center gap-2 rounded-[2rem] px-4 py-3 whitespace-nowrap transition-all duration-500 sm:gap-4 sm:px-8 sm:py-4',
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200'
                    : 'text-slate-400 hover:bg-white hover:text-slate-900'
                )}
              >
                <div
                  className={cn(
                    'rounded-xl p-1.5 transition-colors sm:p-2',
                    isActive
                      ? 'bg-white/10'
                      : 'bg-slate-100 group-hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm leading-none font-black">{tab.label}</p>
                  <p
                    className={cn(
                      'mt-1 text-[10px] font-bold',
                      isActive ? 'text-white/40' : 'text-slate-400'
                    )}
                  >
                    {tab.desc}
                  </p>
                </div>
                <span className="text-xs font-black sm:hidden">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden flex-col items-end lg:flex">
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
            Last updated
          </p>
          <p className="text-sm font-black text-slate-900">Just now</p>
        </div>
      </div>

      {/* Interactive Content */}
      <div className="overflow-hidden px-2">
        <AnimatePresence mode="wait">
          {currentTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              <div className="lg:col-span-2">
                <FinanceChart
                  data={chartData}
                  activeRange={timeRange}
                  onRangeChange={handleRangeChange}
                />
              </div>
              <div className="lg:col-span-1">
                <FinanceInsights
                  finances={finances}
                  totalIncome={stats.totalIncome}
                  totalExpenses={stats.totalExpenses}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-[3rem] border border-slate-100 bg-white/50 p-10 shadow-2xl shadow-slate-200/50 backdrop-blur-xl"
            >
              <FinanceList
                finances={finances}
                loading={loading}
                currentPage={currentPage}
                totalPages={Math.ceil(stats.totalRecords / limit)}
                totalRecords={stats.totalRecords}
                onPageChange={setCurrentPage}
                onEdit={(f) => {
                  setEditingFinance(f);
                  setShowForm(true);
                }}
                onDelete={(id) => setDeletingId(id)}
                userRole={user?.role}
                filters={filters}
                onFilterChange={setFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Record Form Overlay */}
      <FinanceForm
        open={showForm}
        finance={editingFinance}
        onClose={() => {
          setShowForm(false);
          setEditingFinance(null);
        }}
        onSubmit={editingFinance ? handleEdit : handleCreate}
      />

      {/* Confirmation Layer */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Irreversible Action"
        message="Are you sure you want to permanently delete this financial record? This will be logged in the system and affect the history."
        confirmText="CONFIRM DELETE"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
