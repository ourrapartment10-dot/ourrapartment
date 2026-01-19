import { format } from 'date-fns';
import {
  Eye,
  Edit2,
  Trash2,
  Banknote,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    property?: {
      block: string;
      unitNumber: string;
    } | null;
  };
}

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
  userRole?: string;
  currentUserId?: string;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onPay: (payment: Payment) => void;
  onManualPay: (payment: Payment) => void;
  onVerify?: (payment: Payment) => void;
}

export default function PaymentsList({
  payments,
  loading,
  userRole,
  currentUserId,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onPay,
  onManualPay,
  onVerify,
}: PaymentsListProps) {
  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 font-medium text-slate-500">Loading records...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/50 bg-white/60 p-20 text-center backdrop-blur-md">
        <div className="shadow-tiny mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50">
          <Banknote className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-[900] tracking-tight text-slate-900">
          No payments found
        </h3>
        <p className="mt-2 max-w-sm font-medium text-slate-500">
          There are no payment records matching your current filters.
        </p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100/80 text-amber-700 border-amber-200';
      case 'PENDING_VERIFICATION':
        return 'bg-purple-100/80 text-purple-700 border-purple-200';
      case 'FAILED':
        return 'bg-red-100/80 text-red-700 border-red-200';
      case 'REFUNDED':
        return 'bg-slate-100/80 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="space-y-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-gradient-to-br from-blue-100 to-indigo-100 font-black text-blue-600 shadow-sm">
                  {payment.user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm leading-tight font-black text-slate-900">
                    {payment.user.name}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {payment.user.property
                      ? `${payment.user.property.block ? payment.user.property.block + '-' : ''}${payment.user.property.unitNumber}`
                      : 'No Property'}
                  </div>
                </div>
              </div>
              <span
                className={`rounded-lg border px-2.5 py-1 text-[9px] font-black tracking-[0.15em] uppercase ${getStatusStyle(payment.status)}`}
              >
                {payment.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between border-y border-slate-100/50 py-4">
              <div>
                <div className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Details
                </div>
                <div className="text-xs leading-none font-black text-slate-900 capitalize">
                  {payment.type.toLowerCase()}
                </div>
                <div className="mt-1 line-clamp-1 text-[10px] font-bold text-slate-500">
                  {payment.description}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Amount
                </div>
                <div className="text-lg leading-none font-[1000] tracking-tighter text-slate-900">
                  {formatCurrency(payment.amount)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Created
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              {payment.dueDate && (
                <div className="text-right">
                  <div className="mb-1 text-[10px] font-black tracking-widest text-red-400 uppercase">
                    Due Date
                  </div>
                  <div className="text-xs font-black text-red-500">
                    {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {/* Actions for Residents/Self */}
              {(userRole === 'RESIDENT' || payment.user.id === currentUserId) &&
                (payment.status === 'PENDING' ||
                  payment.status === 'FAILED') && (
                  <>
                    <button
                      onClick={() => onPay(payment)}
                      className="flex-1 rounded-xl bg-slate-900 py-3 text-[10px] font-black tracking-[0.1em] text-white uppercase shadow-lg transition-all hover:bg-black active:scale-95"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => onManualPay(payment)}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-slate-400 hover:text-blue-600 hover:shadow-sm"
                      title="Manual Payment"
                    >
                      <Banknote className="h-4 w-4" />
                    </button>
                  </>
                )}

              {/* Verification for Admins */}
              {userRole !== 'RESIDENT' &&
                payment.status === 'PENDING_VERIFICATION' &&
                onVerify && (
                  <button
                    onClick={() => onVerify(payment)}
                    className="w-full rounded-xl bg-purple-600 py-3 text-[10px] font-black tracking-[0.1em] text-white uppercase shadow-lg transition-all hover:bg-purple-700"
                  >
                    Verify Transaction
                  </button>
                )}

              {/* Admin Actions */}
              {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(payment)}
                    disabled={payment.status === 'COMPLETED'}
                    className={`rounded-xl border p-3 transition-all ${payment.status === 'COMPLETED' ? 'cursor-not-allowed border-slate-100 text-slate-200' : 'border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(payment.id)}
                    disabled={payment.status === 'COMPLETED'}
                    className={`rounded-xl border p-3 transition-all ${payment.status === 'COMPLETED' ? 'cursor-not-allowed border-slate-100 text-slate-200' : 'border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/60 shadow-sm backdrop-blur-md md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Recipient / Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Transaction Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Settlement
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Verification
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Timeline
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Administrative
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="group transition-all hover:bg-blue-50/20"
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 font-black text-slate-600 shadow-sm transition-colors group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600">
                        {payment.user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-[900] tracking-tight text-slate-900">
                          {payment.user.name}
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {payment.user.property
                            ? `${payment.user.property.block ? payment.user.property.block + '-' : ''}${payment.user.property.unitNumber}`
                            : 'No Property'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-xs font-black tracking-[0.1em] text-slate-800 uppercase">
                      {payment.type}
                    </div>
                    <div
                      className="mt-1 max-w-[200px] truncate text-xs font-bold text-slate-400"
                      title={payment.description}
                    >
                      {payment.description}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-base font-[1000] tracking-tighter text-slate-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-xl border px-3 py-1.5 text-[9px] font-black tracking-[0.2em] uppercase ${getStatusStyle(payment.status)}`}
                    >
                      {payment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </span>
                      {payment.dueDate && (
                        <span className="mt-1.5 flex items-center text-[10px] font-black tracking-wider text-red-500/80 uppercase">
                          <Clock className="mr-1 h-3 w-3" /> Due:{' '}
                          {format(new Date(payment.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right whitespace-nowrap">
                    <div className="flex translate-x-2 items-center justify-end gap-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                      {/* Resident Pay Logic */}
                      {(userRole === 'RESIDENT' ||
                        payment.user.id === currentUserId) &&
                        (payment.status === 'PENDING' ||
                          payment.status === 'FAILED') && (
                          <>
                            <button
                              onClick={() => onPay(payment)}
                              className="rounded-xl bg-slate-900 px-5 py-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-black active:scale-95"
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => onManualPay(payment)}
                              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition-all hover:border-blue-200 hover:text-blue-600"
                              title="Manual Entry"
                            >
                              <Banknote className="h-4 w-4" />
                            </button>
                          </>
                        )}

                      {/* Admin Verification Logic */}
                      {userRole !== 'RESIDENT' &&
                        payment.status === 'PENDING_VERIFICATION' &&
                        onVerify && (
                          <button
                            onClick={() => onVerify(payment)}
                            className="rounded-xl bg-purple-600 px-5 py-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-purple-700"
                          >
                            Verify
                          </button>
                        )}

                      {/* Admin Edit/Delete */}
                      {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                        <div className="flex rounded-xl border border-slate-100 bg-slate-50 p-1">
                          <button
                            onClick={() => onEdit(payment)}
                            disabled={payment.status === 'COMPLETED'}
                            className={`rounded-lg p-2 transition-all ${payment.status === 'COMPLETED' ? 'cursor-not-allowed text-slate-200' : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(payment.id)}
                            disabled={payment.status === 'COMPLETED'}
                            className={`rounded-lg p-2 transition-all ${payment.status === 'COMPLETED' ? 'cursor-not-allowed text-slate-200' : 'text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-white/50 bg-white/40 px-8 py-6 backdrop-blur-sm sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Displaying Results
            </span>
            <div className="rounded-lg bg-slate-900 px-3 py-1 text-[10px] font-black text-white">
              {pagination.page} / {pagination.pages} Units
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-[10px] font-black tracking-widest text-slate-600 uppercase shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(pagination.pages, pagination.page + 1))
              }
              disabled={pagination.page === pagination.pages}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-[10px] font-black tracking-widest text-slate-600 uppercase shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
