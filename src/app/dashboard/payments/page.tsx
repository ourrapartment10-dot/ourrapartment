"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Upload,
    UserCheck,
    CreditCard,
    Shield,
    List,
    Calendar as CalendarIcon,
    BarChart3
} from "lucide-react";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentsList from "@/components/payments/PaymentsList";
import PaymentForm from "@/components/payments/PaymentForm";
import BulkPaymentModal from "@/components/payments/BulkPaymentModal";
import PaymentVerificationList from "@/components/payments/PaymentVerificationList";
import ManualPaymentDialog from "@/components/payments/ManualPaymentDialog";
import RazorpayPaymentForm from "@/components/payments/RazorpayPaymentForm";
import PaymentCalendar from "@/components/payments/PaymentCalendar";
import PaymentCharts from "@/components/payments/PaymentCharts";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function PaymentsPage() {
    const { user } = useAuth();
    const isResident = user?.role === 'RESIDENT';
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // Tabs: 'list', 'verify', 'calendar', 'charts'
    const [currentTab, setCurrentTab] = useState('list');

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]); // Paginated payments for List view
    const [allPayments, setAllPayments] = useState([]); // All payments for Calendar/Charts view
    const [statistics, setStatistics] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

    // Filters
    const [filters, setFilters] = useState({
        status: "",
        type: "",
        startDate: "",
        endDate: "",
        userId: ""
    });

    // Modals
    const [showCreate, setShowCreate] = useState(false);
    const [showBulk, setShowBulk] = useState(false);

    // Action Modals
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [manualPayingPayment, setManualPayingPayment] = useState<any>(null);
    const [payingPayments, setPayingPayments] = useState<any[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch paginated payments for the list view
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...filters
            });

            const res = await fetch(`/api/payments?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch payments");

            const data = await res.json();
            setPayments(data.payments);
            setPagination(data.pagination);
            setStatistics(data.statistics);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    // Fetch all payments for Calendar and Charts
    const fetchAllPayments = useCallback(async () => {
        // Optimized to fetch a large batch for analytics
        try {
            const query = new URLSearchParams({
                limit: '2000', // Fetch reasonably large number for analytics
                communityView: 'true', // Allow gathering community stats even for residents
                // We typically don't apply pagination filters here, but might apply date filters if they exist?
                // For now, let's fetch 'all' relative to global context or if filters are applied, apply them too.
                // It's better to respect filters if possible, or fetch ALL if the user wants general insights.
                // Let's respect filters except page/limit to allow "Charting filtered data"
                ...filters
            });
            // Override page/limit from filters if they leaked in (they shouldn't as we construct explicitly)

            const res = await fetch(`/api/payments?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch analytics data");

            const data = await res.json();
            setAllPayments(data.payments);
        } catch (error) {
            console.error("Analytics fetch error:", error);
            // Silent fail or toast?
        }
    }, [filters]);

    useEffect(() => {
        if (user) {
            fetchPayments();
        }
    }, [fetchPayments, user]);

    // Lazy load logic for analytics data
    useEffect(() => {
        if ((currentTab === 'calendar' || currentTab === 'charts') && user) {
            fetchAllPayments();
        }
    }, [currentTab, fetchAllPayments, user]);


    // Handlers
    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
        // Also trigger refetch of all payments if in chart/calendar mode?
        // Since useEffect [filters] is dependency of fetchAllPayments?, no, fetchAllPayments depends on filters? 
        // fetchAllPayments dependency list includes [filters]. So it will update function reference.
        // We need to validte if we should auto-call it.
        // Let's rely on the user switching tabs or maybe add a separate effect or just call it here if tab is active.
        if (currentTab === 'calendar' || currentTab === 'charts') {
            // It will be called by the effect hook if we add [filters] to dependency array of the effect.
            // Currently the effect only depends on [currentTab, user]. 
            // We should add logic to refetch when filters change if tab is active.
        }
    };

    // Effect to refetch all payments when filters change IF we are in analytics mode
    useEffect(() => {
        if ((currentTab === 'calendar' || currentTab === 'charts') && user) {
            fetchAllPayments();
        }
    }, [filters, user]); // If filters change, update charts


    const handleCreate = async (data: any) => {
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create payment");
            toast.success("Payment created successfully");
            fetchPayments();
            if (currentTab !== 'list') fetchAllPayments();
        } catch (error) {
            toast.error("Failed to create payment");
            throw error;
        }
    };

    const handleBulkCreate = async (data: any) => {
        try {
            const res = await fetch('/api/payments/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to bulk create");
            const result = await res.json();
            toast.success(result.message);
            fetchPayments();
            fetchAllPayments();
        } catch (error) {
            toast.error("Bulk creation failed");
            throw error;
        }
    };

    const handleEdit = async (updatedData: any) => {
        if (!editingPayment) return;
        try {
            const res = await fetch(`/api/payments/${editingPayment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) throw new Error("Failed to update payment");
            toast.success("Payment updated");
            fetchPayments();
            fetchAllPayments();
        } catch (error) {
            toast.error("Update failed");
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
    };

    const performDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/payments/${deletingId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Payment deleted");
            fetchPayments();
            fetchAllPayments();
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const handleManualSubmit = async (id: string, data: any) => {
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to submit");
            toast.success("Submitted for verification");
            fetchPayments();
        } catch (error) {
            toast.error("Submission failed");
            throw error;
        }
    };

    const handleRazorpaySuccess = () => {
        fetchPayments();
        fetchAllPayments();
    };

    const tabs = [
        { id: 'list', label: 'Payments List', icon: List },
        ...(isAdmin ? [{ id: 'verify', label: 'Verifications', icon: UserCheck }] : []),
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        { id: 'charts', label: 'Insights', icon: BarChart3 },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-50/60 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-100/40 rounded-full blur-[150px]" />
            </div>

            {/* Premium Header */}
            <div className="relative pt-8 px-2 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl w-fit"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Overview</span>
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-[900] text-slate-900 tracking-tighter leading-[0.9]"
                            >
                                Payments & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Finances.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-500 text-lg lg:text-xl font-medium max-w-lg leading-relaxed"
                            >
                                {isAdmin ? "Manage community finances, verify transactions, and track revenue seamlessly." : "Track your dues, make easy payments, and manage your financial history."}
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
                            <>
                                <button
                                    onClick={() => setShowBulk(true)}
                                    className="w-full sm:w-auto px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-[2rem] font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Bulk Bill
                                </button>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <Plus className="h-5 w-5" />
                                    New Payment
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Statistics Component (Only on List view) */}
                {statistics && currentTab === 'list' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <PaymentStats statistics={statistics} />
                    </motion.div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="px-2">
                <div className="flex p-1 bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] w-full sm:w-fit shadow-sm overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id)}
                                className={cn(
                                    "px-4 sm:px-6 py-2.5 sm:py-3 rounded-[1.5rem] flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6 px-2 min-h-[500px]">
                {/* List Tab */}
                {currentTab === 'list' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Filters */}
                        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50 shadow-sm">
                            <PaymentFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={() => {
                                    setFilters({ status: "", type: "", startDate: "", endDate: "", userId: "" });
                                    setPagination({ ...pagination, page: 1 });
                                }}
                            />
                        </div>

                        {/* Payments List */}
                        <PaymentsList
                            payments={payments}
                            loading={loading}
                            userRole={user?.role}
                            currentUserId={user?.id}
                            pagination={pagination}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                            onView={() => { }}
                            onEdit={(p) => {
                                setEditingPayment(p);
                                setShowCreate(true);
                            }}
                            onDelete={handleDelete}
                            onPay={(p) => setPayingPayments([p])}
                            onManualPay={(p) => setManualPayingPayment(p)}
                            onVerify={() => setCurrentTab('verify')}
                        />
                    </motion.div>
                )}

                {/* Verify Tab */}
                {currentTab === 'verify' && isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-purple-50/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-purple-100"
                    >
                        <h2 className="text-2xl font-[900] text-purple-900 mb-6 flex items-center tracking-tight">
                            <Shield className="w-6 h-6 mr-3 text-purple-600" />
                            Pending Approvals
                        </h2>
                        <PaymentVerificationList onVerificationComplete={fetchPayments} />
                    </motion.div>
                )}

                {/* Calendar Tab */}
                {currentTab === 'calendar' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="mb-6 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/50 shadow-sm">
                            <PaymentFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={() => {
                                    setFilters({ status: "", type: "", startDate: "", endDate: "", userId: "" });
                                }}
                            />
                        </div>
                        <PaymentCalendar
                            payments={isResident ? allPayments.filter((p: any) => p.userId === user?.id) : allPayments}
                            onPaymentClick={(p) => {
                                // Maybe open edit or details modal?
                                if (isAdmin) {
                                    setEditingPayment(p);
                                    setShowCreate(true);
                                }
                            }}
                            onCreatePayment={isAdmin ? () => setShowCreate(true) : undefined}
                            userRole={user?.role}
                        />
                    </motion.div>
                )}

                {/* Charts Tab */}
                {currentTab === 'charts' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PaymentCharts
                            payments={allPayments}
                            userRole={user?.role}
                            userId={user?.id}
                        />
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            {showCreate && (
                <PaymentForm
                    onClose={() => {
                        setShowCreate(false);
                        setEditingPayment(null);
                    }}
                    onSubmit={editingPayment ? handleEdit : handleCreate}
                    initialData={editingPayment}
                    isEditing={!!editingPayment}
                />
            )}

            {showBulk && (
                <BulkPaymentModal
                    onClose={() => setShowBulk(false)}
                    onSubmit={handleBulkCreate}
                />
            )}

            {manualPayingPayment && (
                <ManualPaymentDialog
                    payment={manualPayingPayment}
                    onClose={() => setManualPayingPayment(null)}
                    onSubmit={handleManualSubmit}
                />
            )}

            {payingPayments.length > 0 && (
                <RazorpayPaymentForm
                    payments={payingPayments}
                    onClose={() => setPayingPayments([])}
                    onPaymentSuccess={handleRazorpaySuccess}
                />
            )}

            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={performDelete}
                title="Delete Payment"
                message="Are you sure you want to delete this payment record? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
