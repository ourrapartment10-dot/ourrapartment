'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Upload,
  UserCheck,
  CreditCard,
  Shield,
  List,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
} from 'lucide-react';
import PaymentStats from '@/components/payments/PaymentStats';
import PaymentFilters from '@/components/payments/PaymentFilters';
import PaymentsList from '@/components/payments/PaymentsList';
import PaymentForm from '@/components/payments/PaymentForm';
import BulkPaymentModal from '@/components/payments/BulkPaymentModal';
import PaymentVerificationList from '@/components/payments/PaymentVerificationList';
import ManualPaymentDialog from '@/components/payments/ManualPaymentDialog';
import RazorpayPaymentForm from '@/components/payments/RazorpayPaymentForm';
import PaymentCalendar from '@/components/payments/PaymentCalendar';
import PaymentCharts from '@/components/payments/PaymentCharts';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/common/ConfirmDialog';

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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: '',
    userId: '',
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

  // View Mode for Admins (Community vs Personal)
  const [viewMode, setViewMode] = useState<'community' | 'personal'>('community');

  // Fetch paginated payments for the list view
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = { ...filters };

      // If Admin is in 'personal' mode, force userId filter to their own ID
      if (isAdmin && viewMode === 'personal' && user?.id) {
        queryParams.userId = user.id;
      }

      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...queryParams,
      });

      const res = await fetch(`/api/payments?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();
      setPayments(data.payments);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, isAdmin, viewMode, user?.id]);

  // Fetch all payments for Calendar and Charts
  const fetchAllPayments = useCallback(async () => {
    if (!user) return;
    try {
      const queryParams = { ...filters };

      // Default communityView logic
      let communityView = 'true';

      // If Admin is in 'personal' mode
      if (isAdmin && viewMode === 'personal') {
        queryParams.userId = user.id;
        communityView = 'false';
      }

      const query = new URLSearchParams({
        limit: '2000',
        communityView,
        ...queryParams,
      });

      const res = await fetch(`/api/payments?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch analytics data');

      const data = await res.json();
      setAllPayments(data.payments);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    }
  }, [filters, isAdmin, viewMode, user]);

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
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Trigger refetch when viewMode changes
  useEffect(() => {
    if (user) {
      fetchPayments();
      if (currentTab === 'calendar' || currentTab === 'charts') {
        fetchAllPayments();
      }
    }
  }, [viewMode]);

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
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create payment');
      toast.success('Payment created successfully');
      fetchPayments();
      if (currentTab !== 'list') fetchAllPayments();
    } catch (error) {
      toast.error('Failed to create payment');
      throw error;
    }
  };

  const handleBulkCreate = async (data: any) => {
    try {
      const res = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to bulk create');
      const result = await res.json();
      toast.success(result.message);
      fetchPayments();
      fetchAllPayments();
    } catch (error) {
      toast.error('Bulk creation failed');
      throw error;
    }
  };

  const handleEdit = async (updatedData: any) => {
    if (!editingPayment) return;
    try {
      const res = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update payment');
      toast.success('Payment updated');
      fetchPayments();
      fetchAllPayments();
    } catch (error) {
      toast.error('Update failed');
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
      const res = await fetch(`/api/payments/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Payment deleted');
      fetchPayments();
      fetchAllPayments();
    } catch (error) {
      toast.error('Delete failed');
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
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit');
      toast.success('Submitted for verification');
      fetchPayments();
    } catch (error) {
      toast.error('Submission failed');
      throw error;
    }
  };

  const handleRazorpaySuccess = () => {
    fetchPayments();
    fetchAllPayments();
  };

  const tabs = [
    { id: 'list', label: 'Payments List', icon: List },
    ...(isAdmin && viewMode === 'community'
      ? [{ id: 'verify', label: 'Verifications', icon: UserCheck }]
      : []),
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'charts', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-blue-50/60 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-purple-100/40 blur-[150px]" />
      </div>

      {/* Premium Header */}
      <div className="relative space-y-8 px-2 pt-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-fit items-center gap-3 rounded-2xl bg-blue-50 px-4 py-2 text-blue-700"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Financial Overview
              </span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
              >
                Payments & <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Finances.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
              >
                {isAdmin && viewMode === 'community'
                  ? 'Manage community finances, verify transactions, and track revenue seamlessly.'
                  : 'Track your dues, make easy payments, and manage your financial history.'}
              </motion.p>
            </div>

            {/* Admin View Toggle */}
            {isAdmin && (
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode('community')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all',
                    viewMode === 'community'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  <Users className="h-4 w-4" />
                  Community
                </button>
                <button
                  onClick={() => setViewMode('personal')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all',
                    viewMode === 'personal'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  <UserCheck className="h-4 w-4" />
                  My Payments
                </button>
              </div>
            )}

            {isAdmin && viewMode === 'community' && (
              <>
                <button
                  onClick={() => setShowBulk(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-[2rem] border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Bill
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] sm:w-auto"
                >
                  <Plus className="h-5 w-5" />
                  New Payment
                </button>
              </>
            )}

            {/* Show 'Make Payment' for personal view (admin acting as resident layout)? 
                Actually admins shouldn't see 'New Payment' in personal view? 
                Or maybe they should see a restricted 'Pay' button? 
                Usually residents see payment method on the list items. 
                Keep it simple: Hide bulk actions. List items have 'Pay' button.
            */}
          </div>
        </div>

        {/* Statistics Component or Skeleton */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-white/50 bg-white/40 p-6 shadow-sm backdrop-blur-md h-32 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/50"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-white/50 rounded"></div>
                    <div className="h-6 w-24 bg-white/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          statistics && currentTab === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PaymentStats statistics={statistics} />
            </motion.div>
          )
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-2">
        <div className="scrollbar-hide flex w-full justify-between sm:justify-start overflow-x-auto rounded-[2rem] border border-white/50 bg-white/60 p-1 shadow-sm backdrop-blur-md sm:w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-[1.5rem] px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-sm flex-1 justify-center sm:flex-none sm:justify-start',
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="xs:inline hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-[500px] space-y-6 px-2">
        {/* List Tab */}
        {currentTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="rounded-[2.5rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
              <PaymentFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters({
                    status: '',
                    type: '',
                    startDate: '',
                    endDate: '',
                    userId: '',
                  });
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
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
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
        {currentTab === 'verify' && isAdmin && viewMode === 'community' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-purple-100 bg-purple-50/50 p-8 backdrop-blur-md"
          >
            <h2 className="mb-6 flex items-center text-2xl font-[900] tracking-tight text-purple-900">
              <Shield className="mr-3 h-6 w-6 text-purple-600" />
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
            <div className="mb-6 rounded-[2.5rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
              <PaymentFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters({
                    status: '',
                    type: '',
                    startDate: '',
                    endDate: '',
                    userId: '',
                  });
                }}
              />
            </div>
            <PaymentCalendar
              payments={
                isResident || (isAdmin && viewMode === 'personal')
                  ? allPayments.filter((p: any) => p.userId === user?.id)
                  : allPayments
              }
              onPaymentClick={(p) => {
                // Maybe open edit or details modal?
                if (isAdmin && viewMode === 'community') {
                  setEditingPayment(p);
                  setShowCreate(true);
                }
              }}
              onCreatePayment={isAdmin && viewMode === 'community' ? () => setShowCreate(true) : undefined}
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
