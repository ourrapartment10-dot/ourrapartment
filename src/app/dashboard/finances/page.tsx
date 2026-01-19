
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import {
    Plus,
    BarChart3,
    List,
    Wallet,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    CalendarDays
} from "lucide-react";
import { FinanceStats } from "@/components/finances/FinanceStats";
import { FinanceChart } from "@/components/finances/FinanceChart";
import { FinanceInsights } from "@/components/finances/FinanceInsights";
import { FinanceList } from "@/components/finances/FinanceList";
import { FinanceForm } from "@/components/finances/FinanceForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        totalRecords: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    // Pagination & Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        category: "",
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
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
            case '1m': start.setMonth(start.getMonth() - 1); break;
            case '3m': start.setMonth(start.getMonth() - 3); break;
            case '6m': start.setMonth(start.getMonth() - 6); break;
            case '1y': start.setFullYear(start.getFullYear() - 1); break;
        }

        setFilters(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        }));
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                ...filters
            });

            const res = await fetch(`/api/finances?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch finances");

            const data = await res.json();
            setFinances(data.finances);
            setStats({
                totalIncome: data.totalIncome,
                totalExpenses: data.totalExpenses,
                netBalance: data.netBalance,
                totalRecords: data.totalRecords
            });

            const combined = [
                ...data.finances.map((f: any) => ({ ...f, type: 'expense' })),
                ...(data.incomeRecords || [])
            ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Group by date/month for chart
            const chartGroups: { [key: string]: { income: number; expense: number; timestamp: number } } = {};

            // 1. Initialize all months/days in the range to ensure zero values are shown
            const current = new Date(filters.startDate);
            const end = new Date(filters.endDate);

            while (current <= end) {
                const dateKey = timeRange === '1m'
                    ? current.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : current.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

                if (!chartGroups[dateKey]) {
                    chartGroups[dateKey] = {
                        income: 0,
                        expense: 0,
                        timestamp: current.getTime()
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
                let dateKey = "";

                if (timeRange === '1m') {
                    dateKey = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                } else {
                    dateKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                }

                if (chartGroups[dateKey]) {
                    if (item.type === 'income') chartGroups[dateKey].income += item.amount;
                    else chartGroups[dateKey].expense += item.amount;
                }
            });

            const mappedChartData = Object.entries(chartGroups)
                .map(([name, vals]) => ({
                    name,
                    ...vals
                }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setChartData(mappedChartData);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load financial data");
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
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create record");
            toast.success("Expense recorded successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to create record");
            throw error;
        }
    };

    const handleEdit = async (data: any) => {
        if (!editingFinance) return;
        try {
            const res = await fetch(`/api/finances/${editingFinance.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update record");
            toast.success("Record updated");
            fetchData();
        } catch (error) {
            toast.error("Update failed");
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/finances/${deletingId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Record deleted");
            fetchData();
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3, desc: 'Balance & statistics' },
        { id: 'list', label: 'Transactions', icon: List, desc: 'Detailed log' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-32">
            {/* Background Polish */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-50/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/30 rounded-full blur-[120px]" />
            </div>

            {/* Premium Header */}
            <div className="relative pt-12 px-2">
                <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center gap-16 lg:gap-24">
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 shadow-sm rounded-full w-fit group cursor-default"
                        >
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-white fill-white" />
                            </div>
                            <span className="text-[11px] font-[900] text-slate-800 uppercase tracking-[0.2em]">Community Financial Portal</span>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-6xl md:text-7xl lg:text-[5rem] xl:text-[6rem] font-[1000] text-slate-900 tracking-[-0.04em] leading-[0.85]"
                            >
                                Community <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600">Financials.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-500 text-lg md:text-xl font-bold max-w-xl leading-relaxed"
                            >
                                A transparent, real-time ecosystem for managing community income and expenditures with intelligent forecasting.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-black text-slate-700">Audit Ready</span>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <CalendarDays className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-black text-slate-700">Real-time Feed</span>
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
                        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 via-indigo-500/20 to-emerald-500/30 blur-[60px] opacity-50 -z-10 animate-pulse" />

                        <div className="bg-slate-950 p-12 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/5">
                            {/* Inner Decorative Elements */}
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                                <Wallet className="w-48 h-48 text-white" />
                            </div>

                            <div className="space-y-10 relative">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h2 className="text-white/40 text-[11px] font-[1000] uppercase tracking-[0.4em]">Live Revenue Stream</h2>
                                    </div>
                                    <p className="text-white/80 text-sm font-bold">Total Collection Found</p>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-white text-7xl font-[1000] tracking-[-0.05em] leading-none flex items-start gap-1">
                                        <span className="text-3xl mt-2 text-emerald-500 font-black">₹</span>
                                        {new Intl.NumberFormat('en-IN').format(stats.totalIncome)}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <p className="text-emerald-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                                <TrendingUp className="w-3 h-3" />
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
                                        className="group/btn relative w-full overflow-hidden py-6 bg-emerald-500 text-white rounded-[2.5rem] font-[1000] text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-400 active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                        <span className="relative flex items-center justify-center gap-3">
                                            <Plus className="h-5 w-5 stroke-[4]" />
                                            Record New Expense
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Floating Status Badge */}
                        <div className="absolute -top-4 -right-4 bg-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Audit</span>
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
            <div className="px-2 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="flex p-2 bg-slate-50/80 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-[2rem] transition-all duration-500 group whitespace-nowrap flex-shrink-0",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-200"
                                        : "hover:bg-white text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 sm:p-2 rounded-xl transition-colors",
                                    isActive ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-50"
                                )}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-black leading-none">{tab.label}</p>
                                    <p className={cn("text-[10px] font-bold mt-1", isActive ? "text-white/40" : "text-slate-400")}>
                                        {tab.desc}
                                    </p>
                                </div>
                                <span className="sm:hidden text-xs font-black">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden lg:flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Last updated</p>
                    <p className="text-sm font-black text-slate-900">Just now</p>
                </div>
            </div>

            {/* Interactive Content */}
            <div className="px-2 overflow-hidden">
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
                            className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50"
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
